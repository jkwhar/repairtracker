/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // Seed parts
  const partNames = [
    "Keyboard",
    "Key(s)",
    "Whole Display",
    "Case Swap",
    "Headphone Jack Piece",
    "Broken Headphone Jack",
    "Reset Battery",
    "Battery",
    "Motherboard",
    "Daughterboard",
    "Top Cover",
    "Trackpad",
    "Trackpad Cable",
    "Camera",
    "Camera Connection",
    "USB Broken Piece",
    "Reinstalled OS",
    "Powerwashed",
  ];

  const partsCol = app.findCollectionByNameOrId("parts");
  for (const name of partNames) {
    const record = new Record(partsCol, { name, active: true });
    app.save(record);
  }

  // Seed outcomes
  const outcomesCol = app.findCollectionByNameOrId("outcomes");

  const repaired = new Record(outcomesCol, { name: "Repaired", is_default: true });
  app.save(repaired);

  const unrepairable = new Record(outcomesCol, { name: "Unrepairable", is_default: false });
  app.save(unrepairable);
}, (app) => {
  const outcomes = app.findRecordsByFilter("outcomes", "name = 'Repaired' || name = 'Unrepairable'", "", 0, 0);
  for (const r of outcomes) {
    app.delete(r);
  }

  const parts = app.findRecordsByFilter("parts", "active = true", "", 0, 0);
  for (const r of parts) {
    app.delete(r);
  }
});
