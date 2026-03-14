/// <reference path="../pb_data/types.d.ts" />

// Log every record deletion to the audit_logs collection.
onRecordAfterDeleteRequest((e) => {
  try {
    const auditCol = $app.dao().findCollectionByNameOrId("audit_logs");
    const authRecord = e.httpContext.get("authRecord");

    const entry = new Record(auditCol, {
      action: "delete",
      collection_name: e.record.collection().name,
      record_id: e.record.id,
      performed_by: authRecord ? authRecord.id : "",
      performed_by_username: authRecord ? authRecord.getString("username") : "system",
      details: JSON.stringify(e.record.publicExport()),
    });

    $app.dao().saveRecord(entry);
  } catch (err) {
    // Never let audit failures break the main delete operation
    console.error("[audit]", String(err));
  }
});
