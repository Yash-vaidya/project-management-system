import { useState, useEffect } from "react";
import { excelToJson } from "../utils/excelToJson";
import { useToast } from "../utils/ToastContext";

function TaskSheetViewer({ taskSheet, title = "Task Sheet", onSave, toggleSidebar, isSidebarCollapsed }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [importType, setImportType] = useState("excel");
  const [importText, setImportText] = useState("");
  const { addToast } = useToast();

  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("#8b5cf6");
  const [statusConfig, setStatusConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(`statusConfig_${title}`);
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
      "Pending": "#f59e0b",
      "In Progress": "#3b82f6",
      "Completed": "#10b981",
      "Done": "#10b981",
      "Hold": "#ef4444"
    };
  });

  const handleAddStatus = () => {
    if (!newStatusLabel.trim()) return;
    const newConfig = { ...statusConfig, [newStatusLabel.trim()]: newStatusColor };
    setStatusConfig(newConfig);
    localStorage.setItem(`statusConfig_${title}`, JSON.stringify(newConfig));
    setNewStatusLabel("");
  };

  const handleDeleteStatus = (label) => {
    const newConfig = { ...statusConfig };
    delete newConfig[label];
    setStatusConfig(newConfig);
    localStorage.setItem(`statusConfig_${title}`, JSON.stringify(newConfig));
  };

  const updateData = (newData, autoSave = false, options = {}) => {
    // Check if data actually changed before adding to history
    if (JSON.stringify(data) !== JSON.stringify(newData)) {
      setHistory(prev => [...prev, data]);
    }
    setData(newData);
    if (autoSave && onSave) {
      onSave(newData, options);
    }
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
    updateData(newData, true);
    addToast("Column added successfully", "success");
  };

  const deleteColumn = (colKey) => {
    const newData = data.map(row => {
      const { [colKey]: removed, ...rest } = row;
      return rest;
    });
    updateData(newData, true);
  };

  const moveColumn = (colKey, direction) => {
    const keys = Object.keys(data[0]);
    const index = keys.indexOf(colKey);
    if (index === -1) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= keys.length) return;

    const newKeys = [...keys];
    const temp = newKeys[index];
    newKeys[index] = newKeys[newIndex];
    newKeys[newIndex] = temp;

    const newData = data.map(row => {
      const newRow = {};
      newKeys.forEach(k => {
        newRow[k] = row[k];
      });
      return newRow;
    });
    updateData(newData, true);
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
    updateData(newData, true);
  };

  const handleImport = () => {
    if (importType === "excel") {
      try {
        const parsed = excelToJson(importText);
        if (parsed.length) {
          updateData(parsed, true);
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
    updateData(initialData, true);
  };

  useEffect(() => {
    if (!taskSheet) {
      setData([]);
      return;
    }
    try {
      const parsed = typeof taskSheet === 'string' ? JSON.parse(taskSheet) : taskSheet;
      if (Array.isArray(parsed)) {
        // Only clear history if the incoming data is significantly different from current local data
        // This prevents the history crash when auto-saving.
        if (JSON.stringify(data) !== JSON.stringify(parsed)) {
          setData(parsed);
          setHistory([]);
          setError("");
        }
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
    <>
    <div className="card-saas p-0 overflow-hidden animate-fadeIn">
      {/* Table Header / Action Bar */}
      <div className="px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">{title}</h3>
          <span className="px-2 py-0.5 bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-[10px] font-bold rounded">
            {data.length} RECORDS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsImporting(!isImporting)}
            className="p-1.5 px-3 bg-[var(--bg-color)] hover:bg-[var(--border-color)] rounded text-[10px] font-bold uppercase transition-all"
          >
             📥 Import
          </button>
          <button 
            onClick={() => setIsManageModalOpen(true)}
            className="p-1.5 px-3 bg-[var(--primary-color)] text-white hover:opacity-90 rounded text-[10px] font-bold uppercase transition-all flex items-center gap-2"
          >
            ⚙️ Table Management
          </button>
        </div>
      </div>

      {/* Import Panel */}
      {isImporting && (
        <div className="p-6 bg-[var(--bg-color)] border-b border-[var(--border-color)] animate-fadeIn">
          <div className="flex gap-4 mb-4">
            <button 
              onClick={() => setImportType("excel")}
              className={`px-4 py-2 rounded font-bold text-xs uppercase transition-all ${importType === "excel" ? "bg-[var(--primary-color)] text-white shadow-md" : "bg-[var(--bg-color)] text-[var(--text-secondary)]"}`}
            >
              Paste Excel
            </button>
            <button 
              onClick={() => setImportType("google")}
              className={`px-4 py-2 rounded font-bold text-xs uppercase transition-all ${importType === "google" ? "bg-[var(--primary-color)] text-white shadow-md" : "bg-[var(--bg-color)] text-[var(--text-secondary)]"}`}
            >
              Remote Link
            </button>
          </div>
          <div className="flex gap-4">
            {importType === "excel" ? (
              <textarea 
                placeholder="Paste spreadsheet cells here..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="input-saas flex-1 h-24 resize-none text-[11px] font-mono"
              />
            ) : (
              <input 
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="input-saas flex-1 h-11"
              />
            )}
            <button 
              onClick={handleImport}
              className="btn-primary h-11 px-8 shadow-none"
            >
              Import Data
            </button>
          </div>
        </div>
      )}

      {/* Main Table Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-[var(--bg-color)]/50 text-[10px] text-[var(--text-secondary)] font-bold uppercase border-b border-[var(--border-color)]">
            <tr>
              <th className="px-6 py-4 w-12 text-center border-r border-[var(--border-color)]">#</th>
              {Object.keys(data[0]).map((key) => {
                const isStatusColumn = key.toLowerCase().includes("status");
                return (
                  <th key={key} className="p-0 border-r border-[var(--border-color)] group relative min-w-[160px]">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between px-4 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-color)]/20">
                        <button onClick={() => mergeWithNext(key)} className="hover:text-[var(--primary-color)]">🔗</button>
                        <button onClick={() => deleteColumn(key)} className="hover:text-[var(--danger)]">✕</button>
                      </div>
                      <div className="px-4 pb-4">
                        <div 
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => renameHeader(key, e.target.innerText)}
                          className="focus:outline-none focus:text-[var(--primary-color)] font-bold uppercase tracking-widest break-words"
                        >
                          {key}
                        </div>
                        {isStatusColumn && (
                          <div className="flex items-center gap-1 mt-2">
                            <input 
                              type="text" 
                              placeholder="Add Status" 
                              value={newStatusLabel} 
                              onChange={e => setNewStatusLabel(e.target.value)} 
                              className="w-full text-[9px] p-1 bg-[var(--bg-color)] border border-[var(--border-color)] rounded outline-none"
                            />
                            <button 
                              onClick={handleAddStatus} 
                              className="bg-[var(--primary-color)] text-white p-1 rounded aspect-square flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                )})}
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-[var(--bg-color)]/20 transition-colors group">
                <td className="px-6 py-4 text-center font-bold text-[var(--text-secondary)] border-r border-[var(--border-color)]">{i + 1}</td>
                {Object.keys(row).map((key, idx) => {
                  const isStatus = key.toLowerCase().includes("status");
                  return (
                    <td key={idx} className="border-r border-[var(--border-color)] p-0 align-top">
                      {isStatus ? (
                        <div className="p-3">
                          <select 
                            value={row[key] || "Pending"} 
                            onChange={(e) => {
                              const newData = [...data];
                              newData[i] = { ...newData[i], [key]: e.target.value };
                              updateData(newData, true, { silent: true });
                            }}
                            style={{
                              backgroundColor: statusConfig[row[key]] ? statusConfig[row[key]] : 'var(--bg-color)',
                              color: 'white',
                              borderColor: statusConfig[row[key]] ? statusConfig[row[key]] : 'var(--border-color)',
                            }}
                            className="w-full h-8 px-2 rounded font-bold text-[10px] uppercase appearance-none cursor-pointer border focus:outline-none transition-all shadow-sm shadow-black/20"
                          >
                            {Object.keys(statusConfig).map(statusName => (
                              <option key={statusName} value={statusName}>{statusName}</option>
                            ))}
                            {!statusConfig[row[key]] && row[key] && (
                              <option value={row[key]}>{row[key]}</option>
                            )}
                          </select>
                        </div>
                      ) : (
                        <div 
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newValue = e.target.innerText;
                            if (newValue !== row[key]) {
                              const newData = [...data];
                              newData[i] = { ...newData[i], [key]: newValue };
                              updateData(newData, true);
                            }
                          }}
                          className="p-4 min-h-[50px] focus:outline-none focus:bg-[var(--bg-color)]/50 text-[var(--text-primary)] font-medium leading-relaxed"
                        >
                          {row[key]}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingRowIndex(i);
                    }}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-all opacity-0 group-hover:opacity-100"
                    title="Edit Row"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const newData = data.filter((_, index) => index !== i);
                      updateData(newData, true);
                      addToast("Row deleted", "success");
                    }}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--danger)] transition-all opacity-0 group-hover:opacity-100"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-[var(--bg-color)]/30 border-t border-[var(--border-color)] flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (!data || data.length === 0) return;
              const newRow = {};
              Object.keys(data[0]).forEach(k => newRow[k] = "");
              updateData([...data, newRow], true);
            }}
            className="p-2 px-4 bg-[var(--bg-color)] hover:bg-[var(--border-color)] rounded text-[10px] font-bold uppercase transition-all"
          >
            ➕ Add Row
          </button>
          <button
            onClick={undo}
            disabled={history.length === 0}
            className={`p-2 px-4 rounded text-[10px] font-bold uppercase transition-all ${history.length === 0 ? "opacity-30 cursor-not-allowed text-[var(--text-secondary)]" : "bg-[var(--bg-color)] hover:bg-[var(--border-color)]"}`}
          >
            ↩️ Undo
          </button>
        </div>
        
        {onSave && (
          <button
            onClick={() => onSave(data)}
            className="btn-primary py-2 px-8 shadow-none text-[10px]"
          >
            💾 Save Changes
          </button>
        )}
      </div>
    </div>
    
    {/* Table Management Modal */}
    {isManageModalOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="card-saas p-0 w-full max-w-[600px] max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
          <div className="p-6 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)] flex justify-between items-center">
            <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight uppercase">⚙️ Table Management</h3>
            <button onClick={() => setIsManageModalOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">✕</button>
          </div>
          
          <div className="p-6 overflow-y-auto space-y-8 flex-1">
            {/* Column Reordering */}
            <section className="space-y-4">
              <h4 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest border-l-4 border-[var(--primary-color)] pl-3">Column Architecture</h4>
              <div className="space-y-2">
                {Object.keys(data[0] || {}).map((key, i, arr) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-[var(--bg-color)]/50 rounded-lg border border-[var(--border-color)] group">
                    <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-tight">{key}</span>
                    <div className="flex items-center gap-1">
                      <button 
                        disabled={i === 0}
                        onClick={() => moveColumn(key, -1)}
                        className={`p-1.5 rounded hover:bg-[var(--bg-color)] transition-all ${i === 0 ? 'opacity-20' : ''}`}
                      >🔼</button>
                      <button 
                        disabled={i === arr.length - 1}
                        onClick={() => moveColumn(key, 1)}
                        className={`p-1.5 rounded hover:bg-[var(--bg-color)] transition-all ${i === arr.length - 1 ? 'opacity-20' : ''}`}
                      >🔽</button>
                      <button 
                        onClick={() => { if(confirm(`Delete ${key}?`)) deleteColumn(key); }}
                        className="p-1.5 rounded hover:bg-red-500/10 text-red-500 transition-all opacity-0 group-hover:opacity-100"
                      >✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={addColumn}
                className="w-full py-3 border-2 border-dashed border-[var(--border-color)] rounded-xl text-[10px] font-bold text-[var(--text-secondary)] uppercase hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-all mt-4"
              >
                + Forge New Column
              </button>
            </section>

            {/* Status Factory */}
            <section className="space-y-4">
              <h4 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest border-l-4 border-[var(--warning)] pl-3">Status Factory (Dropdowns)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(statusConfig).map(([label, color]) => (
                  <div key={label} className="flex items-center gap-3 p-2 bg-[var(--bg-color)]/20 rounded-lg border border-[var(--border-color)] group">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="text-[10px] font-bold text-[var(--text-primary)] uppercase flex-1">{label}</span>
                    <button onClick={() => handleDeleteStatus(label)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 pt-2">
                <input 
                  type="text" 
                  placeholder="Status Label" 
                  value={newStatusLabel}
                  onChange={(e) => setNewStatusLabel(e.target.value)}
                  className="input-saas flex-1 h-9 text-xs"
                />
                <input 
                  type="color" 
                  value={newStatusColor}
                  onChange={(e) => setNewStatusColor(e.target.value)}
                  className="w-10 h-9 p-0 bg-transparent border-none cursor-pointer"
                />
                <button 
                  onClick={handleAddStatus}
                  className="btn-primary h-9 px-4 text-xs whitespace-nowrap"
                >Add Status</button>
              </div>
            </section>
          </div>
          
          <div className="p-4 bg-[var(--bg-color)]/50 border-t border-[var(--border-color)] flex justify-end">
            <button onClick={() => setIsManageModalOpen(false)} className="btn-primary py-2 px-10">Close Terminal</button>
          </div>
        </div>
      </div>
    )}

    {/* Row Edit Modal */}
    {editingRowIndex !== null && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="card-saas p-0 w-full max-w-[500px] max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
          <div className="p-6 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)] flex justify-between items-center">
            <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight uppercase">✏️ Edit Row #{editingRowIndex + 1}</h3>
            <button onClick={() => setEditingRowIndex(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">✕</button>
          </div>
          
          <div className="p-6 overflow-y-auto space-y-5 flex-1 grayscale-0">
             {Object.entries(data[editingRowIndex]).map(([key, value]) => {
                const isStatus = key.toLowerCase().includes("status");
                return (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">{key}</label>
                    {isStatus ? (
                      <div className="relative">
                        <select 
                          value={value || "Pending"}
                          onChange={(e) => {
                             const newData = [...data];
                             newData[editingRowIndex] = { ...newData[editingRowIndex], [key]: e.target.value };
                             setData(newData);
                          }}
                          style={{
                            backgroundColor: statusConfig[value] ? statusConfig[value] : 'var(--bg-color)',
                            color: 'white'
                          }}
                          className="w-full h-11 px-4 rounded-xl font-bold text-xs uppercase appearance-none cursor-pointer border border-[var(--border-color)] shadow-inner"
                        >
                          {Object.keys(statusConfig).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-xs">▼</div>
                      </div>
                    ) : (
                      <textarea 
                        value={value}
                        onChange={(e) => {
                          const newData = [...data];
                          newData[editingRowIndex] = { ...newData[editingRowIndex], [key]: e.target.value };
                          setData(newData);
                        }}
                        className="input-saas w-full min-h-[80px] py-3 text-xs leading-relaxed"
                      />
                    )}
                  </div>
                );
             })}
          </div>
          
          <div className="p-4 bg-[var(--bg-color)]/50 border-t border-[var(--border-color)] flex justify-end gap-3">
            <button onClick={() => setEditingRowIndex(null)} className="px-6 py-2 text-xs font-bold text-[var(--text-secondary)] uppercase">Cancel</button>
            <button onClick={() => { updateData(data, true); setEditingRowIndex(null); }} className="btn-primary px-10">Confirm Sync</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default TaskSheetViewer;
