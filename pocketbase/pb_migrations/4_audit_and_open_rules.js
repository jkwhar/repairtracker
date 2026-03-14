/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // ── audit_logs collection ─────────────────────────────────────────────────
  const auditLogs = new Collection({
    id: "auditlogs00001",
    name: "audit_logs",
    type: "base",
    fields: [
      { id: "audit_action_field", name: "action", type: "text", required: true, min: 1, max: 50, pattern: "" },
      { id: "audit_collection_field", name: "collection_name", type: "text", required: true, min: 1, max: 100, pattern: "" },
      { id: "audit_record_id_field", name: "record_id", type: "text", required: true, min: 1, max: 100, pattern: "" },
      { id: "audit_performed_by_field", name: "performed_by", type: "text", required: false, max: 100, pattern: "" },
      { id: "audit_username_field", name: "performed_by_username", type: "text", required: false, max: 200, pattern: "" },
      { id: "audit_details_field", name: "details", type: "text", required: false, max: 10000, pattern: "" },
    ],
    indexes: [
      "CREATE INDEX idx_audit_logs_created ON audit_logs (created)",
      "CREATE INDEX idx_audit_logs_collection ON audit_logs (collection_name)",
    ],
    // Only admins can read logs; no one can edit or delete them via API
    listRule: "@request.auth.role = 'admin'",
    viewRule: "@request.auth.role = 'admin'",
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });
  app.save(auditLogs);

  // ── Open rules — all authenticated users get full access ──────────────────
  const openRule = "@request.auth.id != ''";
  const collections = ["devices", "parts", "outcomes", "repairs"];

  for (const name of collections) {
    const col = app.findCollectionByNameOrId(name);
    col.listRule = openRule;
    col.viewRule = openRule;
    col.createRule = openRule;
    col.updateRule = openRule;
    col.deleteRule = openRule;
    app.save(col);
  }

  // Users — any authenticated user can manage users
  const users = app.findCollectionByNameOrId("users");
  users.listRule = openRule;
  users.viewRule = openRule;
  users.createRule = openRule;
  users.updateRule = openRule;
  users.deleteRule = openRule;
  app.save(users);

}, (app) => {
  app.delete(app.findCollectionByNameOrId("audit_logs"));
});
