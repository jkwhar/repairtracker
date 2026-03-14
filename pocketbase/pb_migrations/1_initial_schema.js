/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  // ── devices ──────────────────────────────────────────────────────────────
  const devices = new Collection({
    id: "devices0000001",
    name: "devices",
    type: "base",
    system: false,
    schema: [
      {
        id: "asset_tag_field",
        name: "asset_tag",
        type: "text",
        required: true,
        options: { min: 1, max: 100, pattern: "" },
      },
      {
        id: "dell_serial_field",
        name: "dell_serial",
        type: "text",
        required: true,
        options: { min: 1, max: 100, pattern: "" },
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_devices_asset_tag ON devices (asset_tag)",
      "CREATE UNIQUE INDEX idx_devices_dell_serial ON devices (dell_serial)",
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.record.role = 'admin'",
    updateRule: "@request.auth.record.role = 'admin'",
    deleteRule: "@request.auth.record.role = 'admin'",
  });
  db.saveCollection(devices);

  // ── parts ─────────────────────────────────────────────────────────────────
  const parts = new Collection({
    id: "parts00000001",
    name: "parts",
    type: "base",
    system: false,
    schema: [
      {
        id: "parts_name_field",
        name: "name",
        type: "text",
        required: true,
        options: { min: 1, max: 200, pattern: "" },
      },
      {
        id: "parts_active_field",
        name: "active",
        type: "bool",
        required: false,
        options: {},
      },
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.record.role = 'admin'",
    updateRule: "@request.auth.record.role = 'admin'",
    deleteRule: "@request.auth.record.role = 'admin'",
  });
  db.saveCollection(parts);

  // ── outcomes ─────────────────────────────────────────────────────────────
  const outcomes = new Collection({
    id: "outcomes000001",
    name: "outcomes",
    type: "base",
    system: false,
    schema: [
      {
        id: "outcomes_name_field",
        name: "name",
        type: "text",
        required: true,
        options: { min: 1, max: 200, pattern: "" },
      },
      {
        id: "outcomes_default_field",
        name: "is_default",
        type: "bool",
        required: false,
        options: {},
      },
    ],
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.record.role = 'admin'",
    updateRule: "@request.auth.record.role = 'admin'",
    deleteRule: "@request.auth.record.role = 'admin'",
  });
  db.saveCollection(outcomes);

  // ── repairs ───────────────────────────────────────────────────────────────
  const repairs = new Collection({
    id: "repairs000001",
    name: "repairs",
    type: "base",
    system: false,
    schema: [
      {
        id: "repairs_device_field",
        name: "device",
        type: "relation",
        required: true,
        options: {
          collectionId: "devices0000001",
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
          displayFields: ["asset_tag"],
        },
      },
      {
        id: "repairs_tech_field",
        name: "tech",
        type: "relation",
        required: true,
        options: {
          collectionId: "_pb_users_auth_",
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
          displayFields: ["username"],
        },
      },
      {
        id: "repairs_parts_field",
        name: "parts_used",
        type: "relation",
        required: false,
        options: {
          collectionId: "parts00000001",
          cascadeDelete: false,
          minSelect: null,
          maxSelect: null,
          displayFields: ["name"],
        },
      },
      {
        id: "repairs_outcome_field",
        name: "outcome",
        type: "relation",
        required: true,
        options: {
          collectionId: "outcomes000001",
          cascadeDelete: false,
          minSelect: null,
          maxSelect: 1,
          displayFields: ["name"],
        },
      },
      {
        id: "repairs_notes_field",
        name: "notes",
        type: "text",
        required: false,
        options: { min: null, max: 5000, pattern: "" },
      },
      {
        id: "repairs_photos_field",
        name: "photos",
        type: "file",
        required: false,
        options: {
          mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
          thumbs: ["400x0"],
          maxSelect: 5,
          maxSize: 5242880,
          protected: false,
        },
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
    updateRule: "@request.auth.record.role = 'admin'",
    deleteRule: "@request.auth.record.role = 'admin'",
  });
  db.saveCollection(repairs);
}, (db) => {
  // revert
  db.deleteCollection("repairs");
  db.deleteCollection("outcomes");
  db.deleteCollection("parts");
  db.deleteCollection("devices");
});
