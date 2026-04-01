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
    if (parsed[0] && !Array.isArray(parsed[0]) && "data" in parsed[0]) return parsed;

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
  const saveAll = (updatedTables, silent = false) => {
    setTables(updatedTables);
    if (onSave) {
      onSave(updatedTables);
    }
  };

  // ─── Single-table data update (from TaskSheetViewer) ────────────────────────
  const handleTableSave = (index, newData) => {
    const updated = tables.map((t, i) => (i === index ? { ...t, data: newData } : t));
    saveAll(updated);
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
    <div className="flex flex-col gap-5 mt-4">

      {/* ── Header row ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black dark:text-white text-[var(--text-color)] uppercase tracking-tight flex items-center gap-2">
          <span>{title === "MOM" ? "📝" : "🗓️"}</span>
          {title}
          <span className="text-[var(--accent-color)] opacity-50 text-[10px] font-black uppercase tracking-widest">
            {tables.length} Table{tables.length !== 1 ? "s" : ""}
          </span>
        </h2>
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────────────────── */}
      {tables.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar flex-wrap">
          {tables.map((table, index) => {
            const isActive = activeIndex === index;
            const isConfirming = confirmDeleteIndex === index;

            return (
              <div
                key={index}
                className={`group/tab flex items-center gap-2 rounded-2xl border transition-all duration-200 shrink-0 ${
                  isConfirming
                    ? "bg-red-500/20 border-red-500/40 px-3 py-2"
                    : isActive
                    ? "bg-[var(--accent-color)] border-[var(--accent-color)] shadow-lg px-3 py-2"
                    : "dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 hover:dark:bg-white/10 hover:bg-black/10 px-3 py-2 cursor-pointer"
                }`}
              >
                {isConfirming ? (
                  /* ── Inline delete confirmation ─────────────────────── */
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
                      Delete &quot;{table.name}&quot;?
                    </span>
                    <button
                      onClick={() => deleteTable(index)}
                      className="text-[9px] font-black uppercase bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-400 transition"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setConfirmDeleteIndex(null)}
                      className="text-[9px] font-black uppercase dark:bg-white/20 bg-black/10 dark:text-white text-[var(--text-color)] px-2.5 py-1 rounded-lg hover:dark:bg-white/30 hover:bg-black/20 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Tab click area */}
                    <button
                      onClick={() => { setActiveIndex(index); setConfirmDeleteIndex(null); }}
                      className="flex items-center gap-1.5 focus:outline-none"
                    >
                      <span className="text-[11px]">{title === "MOM" ? "📋" : "📅"}</span>
                      {/* Editable name */}
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        title="Click to rename"
                        onBlur={(e) => handleRenameTable(index, e.target.innerText)}
                        onClick={(e) => { if (isActive) e.stopPropagation(); }}
                        className={`text-[11px] font-black uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-white/50 rounded px-0.5 min-w-[40px] max-w-[140px] truncate ${
                          isActive ? "text-white" : "dark:text-indigo-200/80 text-[var(--text-color)]/80"
                        }`}
                      >
                        {table.name}
                      </span>
                    </button>

                    {/* Delete × */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteIndex(index); }}
                      className={`text-sm leading-none p-0.5 rounded-full transition opacity-0 group-hover/tab:opacity-100 ${
                        isActive
                          ? "text-white/60 hover:text-white hover:bg-white/20"
                          : "dark:text-white/30 text-black/30 hover:text-red-400 hover:bg-red-400/10"
                      }`}
                      title={`Delete ${table.name}`}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            );
          })}

          {/* ── Add Table button ─────────────────────────────────────────── */}
          <button
            onClick={addTable}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl border dark:border-white/10 border-black/10 dark:bg-white/5 bg-black/5 hover:bg-[var(--accent-color)] hover:text-white hover:border-[var(--accent-color)] text-[var(--accent-color)] font-black uppercase tracking-widest text-[10px] transition-all"
          >
            ➕ New Table
          </button>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────────── */}
      {tables.length === 0 && (
        <div className="border dark:border-white/20 border-black/10 rounded-3xl p-14 flex flex-col items-center justify-center dark:bg-white/5 bg-black/5 border-dashed">
          <div className="text-5xl mb-4">{title === "MOM" ? "📝" : "🗓️"}</div>
          <p className="dark:text-indigo-200/70 text-[var(--text-color)]/60 mb-8 font-bold text-center italic text-sm">
            No {title} tables yet. Initialize one to get started.
          </p>
          <button
            onClick={addTable}
            className="bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
          >
            <span className="text-xl">⚡</span> Initialize {title} Table
          </button>
        </div>
      )}

      {/* ── Active table content ─────────────────────────────────────────────── */}
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
