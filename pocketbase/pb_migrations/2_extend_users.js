/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const users = db.findCollectionByNameOrId("users");

  users.schema.addField(new SchemaField({
    id: "users_role_field",
    name: "role",
    type: "select",
    required: true,
    options: {
      maxSelect: 1,
      values: ["tech", "admin"],
    },
  }));

  users.options = {
    ...users.options,
    minPasswordLength: 8,
    allowEmailAuth: false,
    allowUsernameAuth: true,
    requireEmail: false,
  };

  // Techs can view their own record; admins can view all
  users.listRule = "@request.auth.role = 'admin'";
  users.viewRule = "@request.auth.id = id || @request.auth.role = 'admin'";
  users.createRule = "@request.auth.role = 'admin'";
  users.updateRule = "@request.auth.role = 'admin'";
  users.deleteRule = "@request.auth.role = 'admin'";

  db.saveCollection(users);
}, (db) => {
  const users = db.findCollectionByNameOrId("users");
  users.schema.removeField("users_role_field");
  db.saveCollection(users);
});
