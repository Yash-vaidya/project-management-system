export function excelToJson(text) {
  const rows = text.trim().split("\n");

  const headers = rows[0].split("\t").map((h) => h.trim());

  return rows.slice(1).map((row) => {
    const values = row.split("\t");

    let obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || "";
    });

    return obj;
  });
}
