/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
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

  const partsCollection = db.findCollectionByNameOrId("parts");
  for (const name of partNames) {
    const record = new Record(partsCollection, { name, active: true });
    db.saveRecord(record);
  }

  // Seed outcomes
  const outcomesCollection = db.findCollectionByNameOrId("outcomes");

  const repaired = new Record(outcomesCollection, { name: "Repaired", is_default: true });
  db.saveRecord(repaired);

  const unrepairable = new Record(outcomesCollection, { name: "Unrepairable", is_default: false });
  db.saveRecord(unrepairable);
}, (db) => {
  // Remove seeded outcomes
  const outcomes = db.findRecordsByFilter("outcomes", "name = 'Repaired' || name = 'Unrepairable'");
  for (const r of outcomes) {
    db.deleteRecord(r);
  }

  // Remove seeded parts
  const parts = db.findRecordsByFilter("parts", "active = true");
  for (const r of parts) {
    db.deleteRecord(r);
  }
});
