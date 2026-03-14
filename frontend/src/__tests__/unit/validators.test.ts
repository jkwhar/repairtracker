import { describe, it, expect } from "vitest";
import { validateRepairForm } from "@/lib/validators/repair";
import { validateDeviceCsv } from "@/lib/validators/csv";

describe("validateRepairForm", () => {
  const base = {
    device_id: "device123",
    parts_used: ["part1"],
    outcome_id: "outcome1",
    notes: "",
    photos: [],
  };

  it("passes with valid data", () => {
    const result = validateRepairForm(base);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("fails without device", () => {
    const result = validateRepairForm({ ...base, device_id: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.device).toBeTruthy();
  });

  it("fails without parts", () => {
    const result = validateRepairForm({ ...base, parts_used: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.parts_used).toBeTruthy();
  });

  it("fails without outcome", () => {
    const result = validateRepairForm({ ...base, outcome_id: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.outcome).toBeTruthy();
  });

  it("fails with notes over 5000 chars", () => {
    const result = validateRepairForm({ ...base, notes: "x".repeat(5001) });
    expect(result.valid).toBe(false);
    expect(result.errors.notes).toBeTruthy();
  });

  it("fails with more than 5 photos", () => {
    const photos = Array.from({ length: 6 }, (_, i) =>
      new File([""], `photo${i}.jpg`, { type: "image/jpeg" })
    );
    const result = validateRepairForm({ ...base, photos });
    expect(result.valid).toBe(false);
    expect(result.errors.photos).toBeTruthy();
  });

  it("fails with oversized photo", () => {
    const bigFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "big.jpg", { type: "image/jpeg" });
    const result = validateRepairForm({ ...base, photos: [bigFile] });
    expect(result.valid).toBe(false);
    expect(result.errors.photos).toMatch(/5 MB/);
  });
});

describe("validateDeviceCsv", () => {
  it("parses valid rows", () => {
    const data = [
      { asset_tag: "TAG001", dell_serial: "SER001" },
      { asset_tag: "TAG002", dell_serial: "SER002" },
    ];
    const result = validateDeviceCsv(data);
    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  it("errors on missing asset_tag", () => {
    const data = [{ asset_tag: "", dell_serial: "SER001" }];
    const result = validateDeviceCsv(data);
    expect(result.rows).toHaveLength(0);
    expect(result.errors[0].message).toMatch(/asset_tag/);
  });

  it("errors on missing dell_serial", () => {
    const data = [{ asset_tag: "TAG001", dell_serial: "" }];
    const result = validateDeviceCsv(data);
    expect(result.errors[0].message).toMatch(/dell_serial/);
  });

  it("errors on duplicate asset_tag", () => {
    const data = [
      { asset_tag: "TAG001", dell_serial: "SER001" },
      { asset_tag: "TAG001", dell_serial: "SER002" },
    ];
    const result = validateDeviceCsv(data);
    expect(result.rows).toHaveLength(1);
    expect(result.errors[0].message).toMatch(/Duplicate asset_tag/);
  });

  it("errors on duplicate dell_serial", () => {
    const data = [
      { asset_tag: "TAG001", dell_serial: "SER001" },
      { asset_tag: "TAG002", dell_serial: "SER001" },
    ];
    const result = validateDeviceCsv(data);
    expect(result.errors[0].message).toMatch(/Duplicate dell_serial/);
  });
});
