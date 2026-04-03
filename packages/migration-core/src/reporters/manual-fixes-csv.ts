import type { ManualFixRecord } from "@wp2emdash/shared-types";

function escapeCsvValue(value: string): string {
  return `"${value.replace(/"/g, "\"\"")}"`;
}

export function renderManualFixesCsv(records: ManualFixRecord[]): string {
  const lines = ["sourceId,sourceType,reason,detail"];

  for (const record of records) {
    lines.push(
      [
        escapeCsvValue(record.sourceId),
        escapeCsvValue(record.sourceType),
        escapeCsvValue(record.reason),
        escapeCsvValue(record.detail)
      ].join(",")
    );
  }

  return `${lines.join("\n")}\n`;
}
