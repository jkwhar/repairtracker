/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const parts = app.findCollectionByNameOrId("parts");
  parts.fields.add(new NumberField({
    id: "parts_quantity_field",
    name: "quantity",
    required: false,
    min: 0,
    max: 9999,
  }));
  app.save(parts);
}, (app) => {
  const parts = app.findCollectionByNameOrId("parts");
  const field = parts.fields.getById("parts_quantity_field");
  if (field) {
    parts.fields.remove(field);
    app.save(parts);
  }
});
