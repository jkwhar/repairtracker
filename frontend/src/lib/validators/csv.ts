export interface CsvRow {
  asset_tag: string;
  dell_serial: string;
}

export interface CsvValidationResult {
  rows: CsvRow[];
  errors: Array<{ row: number; message: string }>;
}

export function validateDeviceCsv(data: Array<Record<string, string>>): CsvValidationResult {
  const rows: CsvRow[] = [];
  const errors: Array<{ row: number; message: string }> = [];
  const seenAsset = new Set<string>();
  const seenSerial = new Set<string>();

  for (let i = 0; i < data.length; i++) {
    const rowNum = i + 2; // 1-indexed + header row
    const raw = data[i];
    const asset_tag = raw["asset_tag"]?.trim() ?? "";
    const dell_serial = raw["dell_serial"]?.trim() ?? "";

    if (!asset_tag) {
      errors.push({ row: rowNum, message: "Missing asset_tag" });
      continue;
    }
    if (!dell_serial) {
      errors.push({ row: rowNum, message: "Missing dell_serial" });
      continue;
    }
    if (seenAsset.has(asset_tag)) {
      errors.push({ row: rowNum, message: `Duplicate asset_tag: ${asset_tag}` });
      continue;
    }
    if (seenSerial.has(dell_serial)) {
      errors.push({ row: rowNum, message: `Duplicate dell_serial: ${dell_serial}` });
      continue;
    }

    seenAsset.add(asset_tag);
    seenSerial.add(dell_serial);
    rows.push({ asset_tag, dell_serial });
  }

  return { rows, errors };
}
