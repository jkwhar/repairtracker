/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");

  users.fields.add(new SelectField({
    id: "users_role_field",
    name: "role",
    required: true,
    maxSelect: 1,
    values: ["tech", "admin"],
  }));

  // Username-only auth, 8-char minimum password
  users.minPasswordLength = 8;
  users.passwordAuth.identityFields = ["username"];

  // Access rules (migration 4 opens these further)
  users.listRule = "@request.auth.role = 'admin'";
  users.viewRule = "@request.auth.id = id || @request.auth.role = 'admin'";
  users.createRule = "@request.auth.role = 'admin'";
  users.updateRule = "@request.auth.role = 'admin'";
  users.deleteRule = "@request.auth.role = 'admin'";

  app.save(users);
}, (app) => {
  const users = app.findCollectionByNameOrId("users");
  users.fields.removeById("users_role_field");
  app.save(users);
});
