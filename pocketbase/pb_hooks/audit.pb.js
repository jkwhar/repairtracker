/// <reference path="../pb_data/types.d.ts" />

// Log every record deletion to the audit_logs collection.
onRecordAfterDeleteSuccess((e) => {
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
      action: "delete",
      collection_name: collectionName,
      record_id: e.record.id,
      performed_by: performedBy,
      performed_by_username: performedByUsername,
      details: JSON.stringify(e.record.publicExport()),
    });

    $app.save(entry);
  } catch (err) {
    // Never let audit failures break the main delete operation
    console.error("[audit]", String(err));
  }
});
