/// <reference path="../pb_data/types.d.ts" />

// Log every record deletion to the audit_logs collection.
onRecordAfterDeleteSuccess((e) => {
  try {
    const auditCol = $app.findCollectionByNameOrId("audit_logs");

    let performedBy = "";
    let performedByUsername = "system";
    try {
      const reqInfo = e.requestInfo();
      if (reqInfo && reqInfo.auth) {
        performedBy = reqInfo.auth.id;
        performedByUsername = reqInfo.auth.getString("username");
      }
    } catch (_) {}

    const entry = new Record(auditCol, {
      action: "delete",
      collection_name: e.record.collection().name,
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
