/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // ── repairs ──────────────────────────────────────────────────────────────
  // Migration 1 defined this collection's own `fields` array, which
  // (unlike collections scaffolded through the dashboard) does not
  // automatically get `created`/`updated`. Every repair listing query in the
  // app (search, admin list, device history, reports) sorts by `-created`,
  // and every repair listing UI reads `repair.created` to render a date —
  // without this field those requests fail outright with
  // "invalid sort field \"created\"", which is why repairs never showed up
  // anywhere and the reports page got stuck on "Loading reports…" forever
  // (its fetch has no .catch, so the rejected request just left isLoading
  // stuck true).
  const repairs = app.findCollectionByNameOrId("repairs");
  repairs.fields.add(new AutodateField({
    id: "repairs_created_field",
    name: "created",
    onCreate: true,
    onUpdate: false,
  }));
  repairs.fields.add(new AutodateField({
    id: "repairs_updated_field",
    name: "updated",
    onCreate: true,
    onUpdate: true,
  }));
  app.save(repairs);

  // ── audit_logs ───────────────────────────────────────────────────────────
  // Same gap, same fix: lib/api/audit.ts also sorts by `-created`.
  const auditLogs = app.findCollectionByNameOrId("audit_logs");
  auditLogs.fields.add(new AutodateField({
    id: "audit_created_field",
    name: "created",
    onCreate: true,
    onUpdate: false,
  }));
  app.save(auditLogs);
}, (app) => {
  const repairs = app.findCollectionByNameOrId("repairs");
  for (const id of ["repairs_created_field", "repairs_updated_field"]) {
    const field = repairs.fields.getById(id);
    if (field) repairs.fields.remove(field);
  }
  app.save(repairs);

  const auditLogs = app.findCollectionByNameOrId("audit_logs");
  const field = auditLogs.fields.getById("audit_created_field");
  if (field) auditLogs.fields.remove(field);
  app.save(auditLogs);
});
