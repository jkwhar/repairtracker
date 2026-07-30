/// <reference path="../pb_data/types.d.ts" />

// Shared logic for writing one audit_logs entry. Never throws — a broken
// audit write must not break the real create/update/delete operation.
function logAudit(action, e) {
  try {
    const auditCol = $app.findCollectionByNameOrId("audit_logs");

    let performedBy = "";
    let performedByUsername = "system";
    try {
      // e.requestEvent is the HTTP request context in PocketBase v0.36+
      const auth = e.requestEvent && e.requestEvent.auth;
      if (auth) {
        performedBy = auth.id;
        performedByUsername = auth.getString("username");
      }
    } catch (_) {}

    // collection may be a property or method depending on PB version
    let collectionName = "";
    try {
      collectionName = typeof e.record.collection === "function"
        ? e.record.collection().name
        : e.record.collection.name;
    } catch (_) {}

    const entry = new Record(auditCol, {
      action,
      collection_name: collectionName,
      record_id: e.record.id,
      performed_by: performedBy,
      performed_by_username: performedByUsername,
      details: JSON.stringify(e.record.publicExport()),
    });

    $app.save(entry);
  } catch (err) {
    console.error("[audit]", String(err));
  }
}

// Log every record deletion to the audit_logs collection.
onRecordAfterDeleteSuccess((e) => {
  logAudit("delete", e);
});

// Log creates/updates on the collections where an audit trail matters most:
// repairs (accountability for what was logged) and users (role changes,
// password resets — the exact actions a privilege-escalation attempt would
// make).
onRecordAfterCreateSuccess((e) => {
  logAudit("create", e);
}, "repairs", "users");

onRecordAfterUpdateSuccess((e) => {
  logAudit("update", e);
}, "repairs", "users");
