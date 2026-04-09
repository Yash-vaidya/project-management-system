export const calculateMetrics = (dataStr) => {
  if (!dataStr || typeof dataStr !== "string") return { total: 0, completed: 0, inProgress: 0 };
  try {
    const parsed = JSON.parse(dataStr);
    if (!Array.isArray(parsed) || parsed.length === 0) return { total: 0, completed: 0, inProgress: 0 };
    
    let data = [];
    if (parsed[0] && typeof parsed[0] === 'object' && !Array.isArray(parsed[0]) && 'data' in parsed[0]) {
      parsed.forEach(table => { if (Array.isArray(table.data)) data.push(...table.data); });
    } else if (Array.isArray(parsed[0])) {
      parsed.forEach(table => { if (Array.isArray(table)) data.push(...table); });
    } else {
      data = parsed;
    }

    let total = data.length;
    let completed = 0;
    let inProgress = 0;
    
    data.forEach(row => {
      if (!row || typeof row !== 'object') return;
      const statusKey = Object.keys(row).find(k => k.toLowerCase().includes("status"));
      if (statusKey && row[statusKey]) {
        const val = row[statusKey].toString().trim().toLowerCase();
        if (val.startsWith("complet") || val.startsWith("compet") || ["done", "success", "finished", "ok"].includes(val)) {
          completed++;
        } else if (val.includes("progress") || val.includes("ongoing") || val.includes("work")) {
          inProgress++;
        }
      }
    });
    return { total, completed, inProgress };
  } catch { return { total: 0, completed: 0, inProgress: 0 }; }
};
