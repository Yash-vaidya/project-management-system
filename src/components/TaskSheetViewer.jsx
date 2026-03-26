import { useState, useEffect } from "react";
import { excelToJson } from "../utils/excelToJson";
import { useToast } from "../utils/ToastContext";

function TaskSheetViewer({ taskSheet, title = "Task Sheet", onSave, toggleSidebar, isSidebarCollapsed }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importType, setImportType] = useState("excel");
  const [importText, setImportText] = useState("");
  const { addToast } = useToast();

  const updateData = (newData) => {
    setHistory(prev => [...prev, data]);
    setData(newData);
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setData(prev);
  };

  const renameHeader = (oldKey, newKey) => {
    if (!newKey || oldKey === newKey) return;
    const newData = data.map(row => {
      const newRow = {};
      Object.keys(row).forEach(key => {
        if (key === oldKey) {
          newRow[newKey] = row[oldKey];
        } else {
          newRow[key] = row[key];
        }
      });
      return newRow;
    });
    updateData(newData);
  };

  const addColumn = () => {
    const colName = prompt("Enter new column name:");
    if (!colName) return;
    const newData = data.map(row => ({ ...row, [colName]: "" }));
    updateData(newData);
  };

  const deleteColumn = (colKey) => {
    const newData = data.map(row => {
      const { [colKey]: removed, ...rest } = row;
      return rest;
    });
    updateData(newData);
    addToast(`Column "${colKey}" deleted. Use Revert to undo.`, "info");
  };

  const mergeWithNext = (colKey) => {
    const keys = Object.keys(data[0]);
    const currentIndex = keys.indexOf(colKey);
    if (currentIndex === -1 || currentIndex === keys.length - 1) {
      addToast("No next column to merge with.", "warning");
      return;
    }
    const nextKey = keys[currentIndex + 1];
    const newData = data.map(row => {
      const newRow = { ...row };
      newRow[colKey] = `${row[colKey] || ""} ${row[nextKey] || ""}`.trim();
      delete newRow[nextKey];
      return newRow;
    });
    updateData(newData);
    addToast(`Merged "${nextKey}" into "${colKey}". Use Revert to undo.`, "info");
  };

  const handleImport = () => {
    if (importType === "excel") {
      try {
        const parsed = excelToJson(importText);
        if (parsed.length) {
          updateData(parsed);
          setIsImporting(false);
          setImportText("");
          setError("");
          addToast("Data imported successfully", "success");
        } else {
          addToast("Invalid Excel data detected.", "error");
        }
      } catch {
        addToast("Failed to parse Excel data.", "error");
      }
    } else {
      if (importText.includes("docs.google.com/spreadsheets")) {
        if (onSave) onSave(importText);
        setIsImporting(false);
        addToast("Google Sheet linked successfully", "success");
      } else {
        addToast("Invalid Google Sheets link.", "error");
      }
    }
  };

  const initializeTable = () => {
    const initialData = [
      { "Sr No": "1", "Module": "", "Task": "", "Status": "Pending", "Comment": "" }
    ];
    updateData(initialData);
  };

  useEffect(() => {
    if (!taskSheet) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData([]);
      return;
    }
    try {
      const parsed = typeof taskSheet === 'string' ? JSON.parse(taskSheet) : taskSheet;
      if (Array.isArray(parsed)) {
        setData(parsed);
        setError("");
        setHistory([]);
      } else {
        setError("Invalid table data format.");
      }
    } catch {
      setError("Raw text");
    }
  }, [taskSheet]);

  if (typeof taskSheet === 'string' && taskSheet.includes("docs.google.com/spreadsheets")) {
    const previewUrl = taskSheet.includes('/edit') 
      ? taskSheet.replace(/\/edit.*$/, '/preview') 
      : taskSheet;
    
    return (
      <div className="border dark:border-white/20 border-black/10 rounded-xl overflow-hidden shadow-lg h-[600px] w-full bg-white mt-4 relative">
        <button 
          onClick={toggleSidebar}
          className="absolute top-2 left-2 z-10 bg-[var(--accent-color)]/80 hover:bg-[var(--accent-color)] text-white p-2 rounded-lg shadow-lg backdrop-blur-sm transition-all"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? "➡️" : "⬅️"}
        </button>
        <iframe 
          src={previewUrl} 
          className="w-full h-full border-none" 
          title={`${title} Google Sheet`}
        />
      </div>
    );
  }
  
  if (error && error !== "Raw text") {
    return <p className="text-red-400 mt-4">Error: {error}</p>;
  }

  if (error === "Raw text") {
    return (
      <div className="bg-white/10 border border-white/20 p-4 rounded-lg shadow-lg mt-4 w-full overflow-x-auto">
        <pre className="whitespace-pre-wrap">{taskSheet}</pre>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="border dark:border-white/20 border-black/10 rounded-3xl p-10 mt-4 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 border-dashed">
        <p className="dark:text-indigo-200 text-[var(--text-color)]/60 mb-6 font-bold text-center italic">No {title} structure detected in current sector.</p>
        <button 
          onClick={initializeTable}
          className="bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white px-10 py-5 rounded-[30px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4"
        >
          <span className="text-2xl">⚡</span> Initialize {title} Module
        </button>
      </div>
    );
  }

  return (
    <div className="border dark:border-white/20 border-black/10 rounded-3xl overflow-hidden dark:bg-white/5 bg-black/5 shadow-2xl max-w-full mt-4 flex flex-col items-stretch transition-all duration-300">
      <div className="dark:bg-white/10 bg-black/5 p-6 border-b dark:border-white/20 border-black/10 flex justify-between items-center backdrop-blur-3xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="dark:bg-white/10 bg-black/5 dark:hover:bg-white/20 hover:bg-black/10 dark:text-white text-[var(--text-color)] p-2 rounded-xl transition-all border dark:border-white/10 border-black/10"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? "➡️" : "⬅️"}
          </button>
          <h3 className="font-black dark:text-white text-[var(--text-color)] uppercase tracking-tighter">{title} <span className="text-[var(--accent-color)] opacity-50 text-[10px]">Data Grid</span></h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsImporting(!isImporting)}
            className="text-[10px] bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest transition-all border border-indigo-500/20"
          >
             📥 Import
          </button>
          <button 
            onClick={addColumn}
            className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest transition-all border border-emerald-500/20"
          >
            ➕ Col
          </button>
          <span className="text-[10px] bg-[var(--accent-color)] px-4 py-1.5 rounded-full text-white shadow-lg font-black uppercase tracking-[0.2em]">{data.length} Nodes</span>
        </div>
      </div>

      {isImporting && (
        <div className="p-6 bg-indigo-950/30 border-b border-white/10 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex gap-4 mb-4">
            <button 
              onClick={() => setImportType("excel")}
              className={`px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${importType === "excel" ? "bg-indigo-500 text-white shadow-lg" : "bg-white/5 text-indigo-200"}`}
            >
              Excel Matrix
            </button>
            <button 
              onClick={() => setImportType("google")}
              className={`px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${importType === "google" ? "bg-indigo-500 text-white shadow-lg" : "bg-white/5 text-indigo-200"}`}
            >
              Google Vector
            </button>
          </div>
          <div className="flex gap-4">
            {importType === "excel" ? (
              <textarea 
                placeholder="Paste system data matrix directly from source..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-xs"
                rows={3}
              />
            ) : (
              <input 
                placeholder="Enter secure Google Drive vector link..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-xs"
              />
            )}
            <button 
              onClick={handleImport}
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all"
            >
              Injection
            </button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto pb-6 custom-scrollbar">
        <table className="w-full text-sm text-left dark:text-indigo-100 text-[var(--text-color)] table-auto border-collapse">
          <thead className="text-[10px] uppercase dark:bg-white/10 bg-black/20 dark:text-indigo-50 text-white font-black tracking-widest">
            <tr>
              <th 
                className="px-6 py-4 border-r dark:border-white/10 border-black/10 w-12 text-center cursor-pointer hover:bg-white/5 transition-colors"
                onClick={toggleSidebar}
                title="Click to toggle sidebar"
              >
                #
              </th>
              {Object.keys(data[0]).map((key, i) => (
                <th key={i} className="p-0 border-r dark:border-white/10 border-black/10 group/header relative" style={{ minWidth: '150px' }}>
                  <div className="flex flex-col h-full min-h-[80px]">
                    <div className="flex items-center justify-between px-4 py-2 bg-black/5 dark:bg-white/5 border-b dark:border-white/10 border-black/10">
                      <button 
                        onClick={() => mergeWithNext(key)}
                        className="opacity-0 group-hover/header:opacity-100 transition-opacity text-indigo-400 hover:text-indigo-300 text-[10px] p-1 rounded hover:bg-white/10"
                        title="Merge with right"
                      >
                        🔗
                      </button>
                      <button 
                        onClick={() => deleteColumn(key)}
                        className="opacity-0 group-hover/header:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-1 rounded hover:bg-white/10"
                        title="Delete Column"
                      >
                        ×
                      </button>
                    </div>
                    <div 
                      className="px-4 py-3 h-full overflow-hidden flex-1" 
                      style={{ resize: 'horizontal', minWidth: '100%', maxWidth: '600px' }}
                    >
                      <div 
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => renameHeader(key, e.target.innerText)}
                        className="focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] rounded px-1 transition-all bg-transparent font-black tracking-widest leading-tight w-full break-words"
                      >
                        {key}
                      </div>
                    </div>
                  </div>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent-color)] opacity-0 group-hover/header:opacity-30 transition-opacity"></span>
                </th>
              ))}
              <th className="px-6 py-4 text-center min-w-[80px]">Vector</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-white/5 divide-black/5">
            {data.map((row, i) => (
              <tr key={i} className="border-b border-white/10 hover:bg-white/5 transition group">
                <td 
                  className="px-4 py-3 border-r border-black/5 dark:border-white/10 text-center font-bold dark:text-indigo-400/60 text-[var(--text-color)]/40 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 hover:text-[var(--accent-color)] transition-all"
                  onClick={toggleSidebar}
                  title="Click to toggle sidebar"
                >
                  {i + 1}
                </td>
                {Object.keys(row).map((key, idx) => {
                  const isStatus = key.toLowerCase().includes("status");
                  return (
                    <td key={idx} className="border-r border-white/10 p-4 relative align-top">
                      {isStatus ? (
                        <select 
                          value={row[key]} 
                          onChange={(e) => {
                            const newData = [...data];
                            newData[i] = { ...newData[i], [key]: e.target.value };
                            updateData(newData);
                          }}
                          className="w-full bg-black/5 dark:bg-white/5 rounded-xl px-3 py-2 dark:text-white text-[var(--text-color)] border dark:border-white/10 border-black/10 focus:border-[var(--accent-color)] focus:outline-none appearance-none cursor-pointer font-bold text-xs"
                        >
                          <option className="text-black bg-white" value="Pending">Pending</option>
                          <option className="text-black bg-white" value="In Progress">In Progress</option>
                          <option className="text-black bg-white" value="Completed">Completed</option>
                          <option className="text-black bg-white" value="Hold">Hold</option>
                          {!["Pending", "In Progress", "Completed", "Hold"].includes(row[key]) && row[key] && (
                            <option className="text-black bg-white" value={row[key]}>{row[key]}</option>
                          )}
                        </select>
                      ) : (
                        <div 
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newValue = e.target.innerText;
                            if (newValue !== row[key]) {
                              const newData = [...data];
                              newData[i] = { ...newData[i], [key]: newValue };
                              updateData(newData);
                            }
                          }}
                          className="w-full min-h-[1.5em] bg-transparent dark:text-white text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 rounded-xl px-2 transition-all break-words whitespace-pre-wrap font-medium"
                        >
                          {row[key]}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center opacity-0 group-hover:opacity-100 transition">
                  <button 
                    onClick={() => {
                      const newData = data.filter((_, index) => index !== i);
                      updateData(newData);
                    }}
                    className="text-red-400 hover:text-red-300 transition p-2 rounded-lg hover:bg-red-500/20"
                    title="Delete Row"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 dark:bg-white/5 bg-black/5 border-t dark:border-white/20 border-black/10 flex gap-4 items-center flex-wrap backdrop-blur-3xl">
        <button
          onClick={() => {
            if (!data || data.length === 0) return;
            const newRow = {};
            Object.keys(data[0]).forEach(k => newRow[k] = "");
            updateData([...data, newRow]);
          }}
          className="bg-black/10 dark:bg-white/10 hover:bg-[var(--accent-color)] border dark:border-white/10 border-black/10 text-[var(--text-color)] hover:text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all inline-flex items-center gap-2 group"
        >
          <span className="group-hover:rotate-90 transition-transform">➕</span> Data Unit
        </button>
        <button
          onClick={undo}
          disabled={history.length === 0}
          className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all inline-flex items-center gap-2 ${history.length === 0 ? "opacity-30 cursor-not-allowed dark:text-indigo-300 text-black/50 bg-black/5 border border-transparent" : "dark:bg-white/10 bg-black/10 hover:bg-red-500/20 text-[var(--text-color)] border dark:border-white/10 border-black/10"}`}
        >
          <span>↩️</span> Revert
        </button>
        <div className="flex-1"></div>
        {onSave && (
          <button
            onClick={() => onSave(data)}
            className="bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white px-10 py-3 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-green-600/20 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
          >
            <span>💾</span> Store System State
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskSheetViewer;
