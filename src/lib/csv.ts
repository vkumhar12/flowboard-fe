// Hand-rolled CSV read/write (RFC 4180-ish) — small and bounded enough not
// to need a dependency: quoted fields, embedded commas/newlines, and
// doubled-quote escaping are all it needs to handle correctly.

const escapeCsvField = (value: string): string =>
  /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

export const toCsv = (rows: (string | number | null | undefined)[][]): string =>
  rows.map((row) => row.map((v) => escapeCsvField(String(v ?? ""))).join(",")).join("\r\n");

// Parses CSV text into rows of raw string cells. Blank trailing lines are
// dropped; everything else (quoted fields, embedded commas/newlines) is
// handled via a small state machine rather than a naive split(",").
export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (char === "\r") {
      i++;
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += char;
    i++;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
};
