/// <reference path="../pb_data/types.d.ts" />

// PocketBase's JSVM evaluates each onRecordXXX callback in isolation from
// the rest of this file — a shared top-level helper function (or anything
// attached to $app from outside the callback) throws "ReferenceError: ...
// is not defined" the moment the hook actually fires, which PocketBase then
// surfaces to the API caller as a false "Failed to create record." even
// though the record was already saved. So the audit-log-write logic below
// is duplicated inline in each hook rather than factored out — don't
// "clean this up" into a shared function without re-verifying against a
// live PocketBase instance first.

// Log every record deletion to the audit_logs collection.
onRecordAfterDeleteSuccess((e) => {
  try {
    const auditCol = $app.findCollectionByNameOrId("audit_logs");

    let performedBy = "";
    let performedByUsername = "system";
    try {
      const auth = e.requestEvent && e.requestEvent.auth;
      if (auth) {
        performedBy = auth.id;
        performedByUsername = auth.getString("username");
      }
    } catch (_) {}

    let collectionName = "";
    try {
      collectionName = typeof e.record.collection === "function"
        ? e.record.collection().name
        : e.record.collection.name;
    } catch (_) {}

    const entry = new Record(auditCol, {
      action: "delete",
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
});

// Log creates/updates on the collections where an audit trail matters most:
// repairs (accountability for what was logged) and users (role changes,
// password resets — the exact actions a privilege-escalation attempt would
// make).
onRecordAfterCreateSuccess((e) => {
  try {
    const auditCol = $app.findCollectionByNameOrId("audit_logs");

    let performedBy = "";
    let performedByUsername = "system";
    try {
      const auth = e.requestEvent && e.requestEvent.auth;
      if (auth) {
        performedBy = auth.id;
        performedByUsername = auth.getString("username");
      }
    } catch (_) {}

    let collectionName = "";
    try {
      collectionName = typeof e.record.collection === "function"
        ? e.record.collection().name
        : e.record.collection.name;
    } catch (_) {}

    const entry = new Record(auditCol, {
      action: "create",
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
}, "repairs", "users");

onRecordAfterUpdateSuccess((e) => {
  try {
    const auditCol = $app.findCollectionByNameOrId("audit_logs");

    let performedBy = "";
    let performedByUsername = "system";
    try {
      const auth = e.requestEvent && e.requestEvent.auth;
      if (auth) {
        performedBy = auth.id;
        performedByUsername = auth.getString("username");
      }
    } catch (_) {}

    let collectionName = "";
    try {
      collectionName = typeof e.record.collection === "function"
        ? e.record.collection().name
        : e.record.collection.name;
    } catch (_) {}

    const entry = new Record(auditCol, {
      action: "update",
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
}, "repairs", "users");
