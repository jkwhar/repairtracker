/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // ── devices ──────────────────────────────────────────────────────────────
  const devices = new Collection({
    id: "devices0000001",
    name: "devices",
    type: "base",
    fields: [
      { id: "asset_tag_field", name: "asset_tag", type: "text", required: true, min: 1, max: 100, pattern: "" },
      { id: "dell_serial_field", name: "dell_serial", type: "text", required: true, min: 1, max: 100, pattern: "" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_devices_asset_tag ON devices (asset_tag)",
      "CREATE UNIQUE INDEX idx_devices_dell_serial ON devices (dell_serial)",
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
  });
  app.save(devices);

  // ── parts ─────────────────────────────────────────────────────────────────
  const parts = new Collection({
    id: "parts00000001",
    name: "parts",
    type: "base",
    fields: [
      { id: "parts_name_field", name: "name", type: "text", required: true, min: 1, max: 200, pattern: "" },
      { id: "parts_active_field", name: "active", type: "bool" },
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
  });
  app.save(parts);

  // ── outcomes ─────────────────────────────────────────────────────────────
  const outcomes = new Collection({
    id: "outcomes000001",
    name: "outcomes",
    type: "base",
    fields: [
      { id: "outcomes_name_field", name: "name", type: "text", required: true, min: 1, max: 200, pattern: "" },
      { id: "outcomes_default_field", name: "is_default", type: "bool" },
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
  });
  app.save(outcomes);

  // ── repairs ───────────────────────────────────────────────────────────────
  const repairs = new Collection({
    id: "repairs000001",
    name: "repairs",
    type: "base",
    fields: [
      {
        id: "repairs_device_field",
        name: "device",
        type: "relation",
        required: true,
        collectionId: "devices0000001",
        cascadeDelete: false,
        maxSelect: 1,
      },
      {
        id: "repairs_tech_field",
        name: "tech",
        type: "relation",
        required: true,
        collectionId: "_pb_users_auth_",
        cascadeDelete: false,
        maxSelect: 1,
      },
      {
        id: "repairs_parts_field",
        name: "parts_used",
        type: "relation",
        required: false,
        collectionId: "parts00000001",
        cascadeDelete: false,
        maxSelect: null,
      },
      {
        id: "repairs_outcome_field",
        name: "outcome",
        type: "relation",
        required: true,
        collectionId: "outcomes000001",
        cascadeDelete: false,
        maxSelect: 1,
      },
      {
        id: "repairs_notes_field",
        name: "notes",
        type: "text",
        required: false,
        max: 5000,
        pattern: "",
      },
      {
        id: "repairs_photos_field",
        name: "photos",
        type: "file",
        required: false,
        maxSelect: 5,
        maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        thumbs: ["400x0"],
        protected: false,
      },
    ],
    indexes: [
      "CREATE INDEX idx_repairs_device ON repairs (device)",
      "CREATE INDEX idx_repairs_tech ON repairs (tech)",
      "CREATE INDEX idx_repairs_created ON repairs (created)",
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
  });
  app.save(repairs);
}, (app) => {
  app.delete(app.findCollectionByNameOrId("repairs"));
  app.delete(app.findCollectionByNameOrId("outcomes"));
  app.delete(app.findCollectionByNameOrId("parts"));
  app.delete(app.findCollectionByNameOrId("devices"));
});
