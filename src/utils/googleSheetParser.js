export async function fetchGoogleSheetAsJson(url) {
  try {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) throw new Error("Invalid Google Sheets URL");
    const id = match[1];
    
    // Use the Visualization API endpoint to get CSV
    const csvUrl = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`;
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
        throw new Error("Failed to fetch Google Sheet. Make sure 'Anyone with the link can view' is enabled.");
    }
    
    const csvText = await response.text();
    return parseCSVToJSON(csvText);
  } catch (err) {
    console.error("Google Sheet Parser Error:", err);
    throw err;
  }
}

function parseCSVToJSON(csv) {
  const rows = [];
  let row = [];
  let inQuotes = false;
  let cell = '';
  
  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      cell += '"';
      i++; // Skip escaped quote
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if (char === '\n' && !inQuotes) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      if (char !== '\r') cell += char;
    }
  }
  
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => {
    let obj = {};
    headers.forEach((header, index) => {
      // Keep empty strings if the row is shorter than headers
      obj[header] = r[index] !== undefined ? r[index].trim() : "";
    });
    return obj;
  });
}
