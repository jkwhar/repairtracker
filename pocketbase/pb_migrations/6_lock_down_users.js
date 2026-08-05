/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Migration 4 opened create/update/delete on `users` to any authenticated
  // user ("@request.auth.id != ''"), which lets any "tech" account promote
  // itself to admin, reset another user's password, or delete any account.
  // No feature in the app needs a non-admin to create/update/delete users
  // (only UserManager.tsx does, and it's admin-only in intent) — revert
  // those three rules to admin-only, matching migration 2's original values.
  // listRule/viewRule stay open: repairs/search and repair history depend on
  // reading other users' basic records (tech filter dropdown, username via
  // expand).
  const users = app.findCollectionByNameOrId("users");
  users.createRule = "@request.auth.role = 'admin'";
  users.updateRule = "@request.auth.role = 'admin'";
  users.deleteRule = "@request.auth.role = 'admin'";
  app.save(users);
}, (app) => {
  const openRule = "@request.auth.id != ''";
  const users = app.findCollectionByNameOrId("users");
  users.createRule = openRule;
  users.updateRule = openRule;
  users.deleteRule = openRule;
  app.save(users);
});
