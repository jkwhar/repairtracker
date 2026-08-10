/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // PocketBase's built-in `users` auth collection ships with only `email`
  // as an identity field and `email` marked required — but this app is
  // username/password only (see README.md, lib/auth.ts, lib/api/users.ts)
  // and never collects an email address anywhere in its UI. Migration 2
  // added the `role` field but never actually set up username auth, so
  // `createUser()`'s payload (username/password/passwordConfirm/role, no
  // email) was failing validation with "email: cannot be blank" on any
  // deployment where a `username` field + username identity hadn't already
  // been added by hand outside of migrations.
  //
  // Guarded with existence checks so this is safe to run whether or not a
  // given deployment already has a username field configured manually.
  const users = app.findCollectionByNameOrId("users");

  if (!users.fields.getByName("username")) {
    users.fields.add(new TextField({
      id: "users_username_field",
      name: "username",
      required: true,
      min: 1,
      max: 100,
    }));
    users.indexes.push("CREATE UNIQUE INDEX idx_users_username ON users (username)");
  }

  if (!users.passwordAuth.identityFields.includes("username")) {
    users.passwordAuth.identityFields.push("username");
  }

  const emailField = users.fields.getByName("email");
  if (emailField) {
    emailField.required = false;
  }

  app.save(users);
}, (app) => {
  // Down: only revert what's safely reversible. Leaving the username field
  // and identity config in place on rollback avoids breaking logins for any
  // accounts created while this migration was applied.
  const users = app.findCollectionByNameOrId("users");
  const emailField = users.fields.getByName("email");
  if (emailField) {
    emailField.required = true;
  }
  app.save(users);
});
