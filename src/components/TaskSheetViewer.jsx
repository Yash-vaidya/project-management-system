import { useState, useEffect } from "react";

function TaskSheetViewer({ taskSheet, title = "Task Sheet", onSave, toggleSidebar, isSidebarCollapsed }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

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
    return <p className="dark:text-indigo-200 text-[var(--text-color)]/60 mt-4 font-bold">No {title.toLowerCase()} data available.</p>;
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
        <span className="text-[10px] bg-[var(--accent-color)] px-4 py-1 rounded-full text-white shadow-lg font-black uppercase tracking-[0.2em]">{data.length} Nodes</span>
      </div>
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
                <th key={i} className="px-6 py-4 border-r dark:border-white/10 border-black/10 min-w-[150px]">{key}</th>
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
                              setData(newData);
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
