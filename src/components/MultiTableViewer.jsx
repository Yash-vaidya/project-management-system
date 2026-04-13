import { useState, useEffect } from "react";
import TaskSheetViewer from "./TaskSheetViewer";
import { useToast } from "../utils/ToastContext";

/**
 * Parses raw DB value into: [{ name: string, data: row[] }, ...]
 * Handles backward compat:
 *  - null/undefined → []
 *  - [{name, data}]  → new format (pass-through)
 *  - [[row, ...], …] → old multi-table, no names
 *  - [row, ...]      → old single-table
 */
function parseTables(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed) || parsed.length === 0) return [];

    // New format: [{name, data}, ...]
    if (parsed[0] && !Array.isArray(parsed[0]) && "data" in parsed[0]) {
      // Normalize status: "Done" or "Complit" -> "Completed"
      return parsed.map(table => ({
        ...table,
        data: table.data.map(row => {
          const newRow = { ...row };
          Object.keys(newRow).forEach(key => {
            if (key.toLowerCase().includes("status")) {
              const val = newRow[key];
              if (val && typeof val === "string") {
                const lower = val.toLowerCase().trim();
                if (lower === "done" || lower === "complit") {
                  newRow[key] = "Completed";
                }
              }
            }
          });
          return newRow;
        })
      }));
    }

    // Array of arrays: [[row, ...], ...]
    if (Array.isArray(parsed[0])) {
      return parsed.map((data, i) => ({ name: `Table ${i + 1}`, data }));
    }

    // Single table (old format): [row, ...]
    return [{ name: "Table 1", data: parsed }];
  } catch {
    return [];
  }
}

function MultiTableViewer({ tablesData, title = "Table", onSave, toggleSidebar, isSidebarCollapsed }) {
  const [tables, setTables] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const parsed = parseTables(tablesData);
    setTables(parsed);
    setActiveIndex(0);
  }, [tablesData]);

  // ─── Persist all tables upstream ────────────────────────────────────────────
  const saveAll = (updatedTables, options = {}) => {
    setTables(updatedTables);
    if (onSave) {
      onSave(updatedTables, options);
    }
  };

  // ─── Single-table data update (from TaskSheetViewer) ────────────────────────
  const handleTableSave = (index, newData, options = {}) => {
    const updated = tables.map((t, i) => (i === index ? { ...t, data: newData } : t));
    saveAll(updated, options);
  };

  // ─── Rename ─────────────────────────────────────────────────────────────────
  const handleRenameTable = (index, newName) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === tables[index].name) return;
    const updated = tables.map((t, i) => (i === index ? { ...t, name: trimmed } : t));
    saveAll(updated, true); // silent — no toast for rename
  };

  // ─── Add ─────────────────────────────────────────────────────────────────────
  const addTable = () => {
    const blank = {
      name: `${title} ${tables.length + 1}`,
      data: [{ "Sr No": "1", Module: "", Task: "", Status: "Pending", Comment: "" }],
    };
    const updated = [...tables, blank];
    setTables(updated);
    setActiveIndex(updated.length - 1);
    if (onSave) onSave(updated);
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const deleteTable = (index) => {
    const updated = tables.filter((_, i) => i !== index);
    setTables(updated);
    setConfirmDeleteIndex(null);
    setActiveIndex(Math.max(0, Math.min(index, updated.length - 1)));
    if (onSave) onSave(updated);
  };

  const activeTable = tables[activeIndex];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tab Navigation & Management */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 custom-scrollbar shrink">
          {tables.map((table, index) => {
            const isActive = activeIndex === index;
            const isConfirming = confirmDeleteIndex === index;

            if (isConfirming) {
              return (
                <div key={index} className="flex items-center gap-2 bg-[var(--danger)]/10 border border-[var(--danger)]/30 p-2 px-3 rounded-lg animate-fadeIn">
                  <span className="text-[9px] font-bold text-[var(--danger)] uppercase">Delete?</span>
                  <button onClick={() => deleteTable(index)} className="text-[10px] font-bold text-white bg-[var(--danger)] px-2 py-1 rounded">Yes</button>
                  <button onClick={() => setConfirmDeleteIndex(null)} className="text-[10px] font-bold text-[var(--text-secondary)]">No</button>
                </div>
              );
            }

            return (
              <div
                key={index}
                className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-lg shadow-[#556EE6]/20" 
                    : "bg-[var(--card-bg)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-color)]"
                }`}
                onClick={() => { setActiveIndex(index); setConfirmDeleteIndex(null); }}
              >
                <span className="text-xs">{title === "MOM" ? "📋" : "📅"}</span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleRenameTable(index, e.target.innerText)}
                  onClick={(e) => isActive && e.stopPropagation()}
                  className="text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-white/50 rounded px-0.5"
                >
                  {table.name}
                </span>
                {!isConfirming && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteIndex(index); }}
                    className={`ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--danger)] ${isActive ? 'text-white/60 hover:text-white' : ''}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={addTable}
          className="btn-primary h-10 px-4 text-[10px] whitespace-nowrap shadow-none"
        >
          ➕ New {title} Node
        </button>
      </div>

      {/* Empty State */}
      {tables.length === 0 && (
        <div className="card-saas p-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-[var(--primary-color)]/10 rounded-full flex items-center justify-center text-4xl mb-6">
            {title === "MOM" ? "📝" : "🗓️"}
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No {title} Data Detected</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-8 font-medium">
            Initialize a new data vector to begin tracking {title} parameters for this project node.
          </p>
          <button
            onClick={addTable}
            className="btn-primary px-10"
          >
            Create Initial Table
          </button>
        </div>
      )}

      {/* Active Table Viewer */}
      {activeTable && (
        <TaskSheetViewer
          taskSheet={JSON.stringify(activeTable.data)}
          title={activeTable.name}
          onSave={(newData) => handleTableSave(activeIndex, newData)}
          toggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
      )}
    </div>
  );
}

export default MultiTableViewer;
