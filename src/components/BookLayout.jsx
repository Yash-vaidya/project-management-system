import { useState, useEffect } from "react";
import NotesEditor from "./NotesEditor";
import TaskSheetViewer from "./TaskSheetViewer";
import MultiTableViewer from "./MultiTableViewer";
import ProjectDashboard from "./ProjectDashboard";
import { useToast } from "../utils/ToastContext";

function BookLayout({ project, activePage, setActivePage, goBack, onDelete, toggleSidebar, isSidebarCollapsed }) {
  const [flash, setFlash] = useState(false);
  const [isIndexCollapsed, setIsIndexCollapsed] = useState(false);
  const { addToast } = useToast();

  // Trigger flash animation when activePage changes
  useEffect(() => {
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 300);
    return () => clearTimeout(timer);
  }, [activePage]);

  const handleSaveNotes = async (newNotes) => {
    await fetch(`http://localhost:5000/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: newNotes }),
    });
    addToast("Notes saved successfully", "success");
  };

  const handleSaveSheet = async (field, newData) => {
    // newData may be a single table (array of rows) or an array of tables (array of arrays)
    const serialized = typeof newData === "string" ? newData : JSON.stringify(newData);
    await fetch(`http://localhost:5000/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: serialized }),
    });
    const fieldName = field === 'mom' ? 'MOM' : field === 'sod' ? 'SOD' : 'Task Sheet';
    addToast(`${fieldName} saved successfully`, "success");
  };

  // Advanced Helper to calculate dynamic metrics for the Overview
  const calculateMetrics = (dataStr) => {
    if (!dataStr || typeof dataStr !== "string") return { total: 0, completed: 0, inProgress: 0 };
    try {
      const data = JSON.parse(dataStr);
      if (!Array.isArray(data)) return { total: 0, completed: 0, inProgress: 0 };
      
      let completed = 0;
      let inProgress = 0;
      
      data.forEach(row => {
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
      return { total: data.length, completed, inProgress };
    } catch { return { total: 0, completed: 0, inProgress: 0 }; }
  };

  // Aggregate metrics from all sheets
  const taskSheetMetrics = calculateMetrics(project.taskSheet);
  const sodMetrics = calculateMetrics(project.sod);
  const momMetrics = calculateMetrics(project.mom);

  const stats = {
    total: taskSheetMetrics.total + sodMetrics.total, 
    completed: taskSheetMetrics.completed + sodMetrics.completed,
    inProgress: taskSheetMetrics.inProgress + sodMetrics.inProgress,
    meetings: momMetrics.total
  };

  return (
    <div className={`relative flex flex-col items-center justify-center min-h-[85vh] p-0 md:p-6 w-full transition-all duration-500`}>
      {/* ❌ Fixed Close Button (Top Right) */}
      <button 
        onClick={goBack}
        className="fixed top-8 right-8 z-[1000] bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-3 rounded-2xl flex items-center gap-3 border border-red-500/20 shadow-2xl transition-all hover:scale-110 active:scale-95 group font-black uppercase tracking-widest text-[10px]"
        title="Return to Projects Library"
      >
        <span className="text-2xl font-light group-hover:rotate-90 transition-transform">×</span>
        <span className="hidden md:block">Back to Library</span>
      </button>

      {/* 📖 The Open Book Container - Transitions to Full Width on Collapse */}
      <div className={`relative w-full ${isIndexCollapsed ? "max-w-none px-4" : "max-w-6xl"} flex bg-transparent transition-all duration-500`}>
           {/* ⬅️ Left Page (The Index / Sidebar) */}
        <div className={`
          ${isIndexCollapsed ? "w-20" : "flex-[0.35]"} 
          dark:bg-white/10 bg-[var(--nav-bg)] backdrop-blur-3xl border dark:border-white/20 border-black/10 
          rounded-l-[40px] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col transition-all duration-500 z-30
        `}>
          <div className={`p-6 ${isIndexCollapsed ? "px-0 flex flex-col items-center" : ""}`}>
            <div className={`flex justify-between items-start mb-8 w-full ${isIndexCollapsed ? "flex-col items-center gap-4" : ""}`}>
              <div className={isIndexCollapsed ? "text-center" : ""}>
                {!isIndexCollapsed ? (
                  <>
                    <h2 className="text-xl font-black dark:text-white text-[var(--text-color)] tracking-tight uppercase mb-1 drop-shadow-md truncate max-w-[150px]">{project.name}</h2>
                    <div className="h-1 w-8 bg-[var(--accent-color)] rounded-full"></div>
                  </>
                ) : (
                  <div className="w-10 h-10 bg-[var(--accent-color)] rounded-xl flex items-center justify-center shadow-lg text-white font-black">
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {onDelete && !isIndexCollapsed && (
                <button 
                  onClick={onDelete}
                  className="text-red-400 hover:text-red-300 bg-white/5 hover:bg-red-500/20 p-2 rounded-full transition border border-white/5"
                  title="Delete Project"
                >
                  🗑️
                </button>
              )}
            </div>

            <div className={`flex-1 flex flex-col gap-3 w-full ${isIndexCollapsed ? "items-center" : ""}`}>
              {!isIndexCollapsed && <h3 className="text-[10px] font-black dark:text-indigo-300/60 text-[var(--text-color)]/60 uppercase tracking-[0.2em] mb-3 border-b dark:border-indigo-500/20 border-black/10 pb-2">📂 Index</h3>}
              
              {[
                { id: null, label: "System Overview", icon: "📊" },
                { id: "sod", label: "SOD Progress", icon: "🗓️" },
                { id: "task", label: "Task Progress", icon: "📄" },
                { id: "mom", label: "MOM Tracker", icon: "📝" },
                { id: "notes", label: "Notes", icon: "📓" },
                { id: "dashboard", label: "Analytics Hub", icon: "📈" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  title={isIndexCollapsed ? item.label : ""}
                  className={`flex items-center transition-all duration-300 group border border-transparent ${
                    isIndexCollapsed ? "justify-center w-12 h-12 rounded-2xl" : "gap-3 p-3 rounded-xl hover:translate-x-1"
                  } ${
                    activePage === item.id 
                      ? "bg-[var(--accent-color)] shadow-xl shadow-green-600/20 text-white" 
                      : "dark:bg-white/5 bg-black/5 hover:dark:bg-white/10 hover:bg-black/10 dark:text-indigo-100/70 text-[var(--text-color)]/70 dark:hover:text-white hover:text-[var(--text-color)]"
                  }`}
                >
                  <span className={`${isIndexCollapsed ? "text-xl" : "text-xl"} group-hover:scale-110 transition-transform`}>{item.icon}</span>
                  {!isIndexCollapsed && <span className="font-black tracking-widest text-[10px] uppercase">{item.label}</span>}
                </button>
              ))}
            </div>

            {/* Previous Close button was here */}
          </div>
        </div>

        {/* 📘 The Spine (Central Divider) with Sidebar Toggle */}
        <div className="w-10 bg-gradient-to-r from-black/50 via-black/20 to-black/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)] z-40 flex flex-col items-center py-10 relative">
          <button 
            onClick={() => setIsIndexCollapsed(!isIndexCollapsed)}
            className={`absolute top-10 left-1/2 -translate-x-1/2 w-8 h-8 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] rounded-xl flex items-center justify-center text-white shadow-2xl transition-all duration-500 z-50 hover:scale-110 active:scale-95`}
            title={isIndexCollapsed ? "Expand Index" : "Collapse to Sidebar"}
          >
             <span className={`transition-transform duration-500 text-xs ${isIndexCollapsed ? "rotate-180" : ""}`}>
               ◀
             </span>
          </button>
          <div className="w-[1px] h-full bg-white/10 px-[1px]"></div>
        </div>

        {/* ➡️ Right Page (Dynamic Content Area) - Expands to Full Screen on Collapse */}
        <div className={`flex-1 dark:bg-white/5 bg-white backdrop-blur-3xl border dark:border-white/20 border-black/10 rounded-r-[40px] shadow-[20px_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col z-10 relative transition-all duration-500`}>
          
          {/* Transition Slide effect (Page Reveal) */}
          <div className={`absolute inset-0 bg-[var(--bg-color)] z-40 transition-transform duration-700 ease-in-out ${flash ? 'translate-x-0' : 'translate-x-full'}`}></div>

          <div id="scrollable-content" className={`flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar transition-all duration-500 delay-150 ${flash ? 'opacity-0 scale-95 translate-x-4' : 'opacity-100 scale-100 translate-x-0'}`}>
            {!activePage && (
              <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                 {/* Top Metrics Row */}
                 <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/10 backdrop-blur-xl p-6 rounded-3xl shadow-lg group hover:bg-[var(--accent-color)]/5 transition-all duration-500">
                    <p className="dark:text-indigo-300/40 text-[var(--text-color)]/60 text-[10px] font-black uppercase tracking-widest mb-1">Total Tasks</p>
                    <p className="text-5xl font-black dark:text-white text-[var(--text-color)] drop-shadow-md">{stats.total}</p>
                  </div>
                  <div className="dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/10 backdrop-blur-xl p-6 rounded-3xl shadow-lg group hover:bg-[var(--accent-color)]/5 transition-all duration-500">
                    <p className="dark:text-indigo-300/40 text-[var(--text-color)]/60 text-[10px] font-black uppercase tracking-widest mb-1">In Progress</p>
                    <p className="text-5xl font-black dark:text-white text-[var(--text-color)] drop-shadow-md">{stats.inProgress}</p>
                  </div>
                  <div className="dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/10 backdrop-blur-xl p-6 rounded-3xl shadow-lg group hover:bg-[var(--accent-color)]/5 transition-all duration-500">
                    <p className="dark:text-indigo-300/40 text-[var(--text-color)]/60 text-[10px] font-black uppercase tracking-widest mb-1">Completed</p>
                    <p className="text-5xl font-black dark:text-white text-[var(--text-color)] drop-shadow-md">{stats.completed}</p>
                  </div>
                  <div className="dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/10 backdrop-blur-xl p-6 rounded-3xl shadow-lg group hover:bg-[var(--accent-color)]/5 transition-all duration-500">
                    <p className="dark:text-indigo-300/40 text-[var(--text-color)]/60 text-[10px] font-black uppercase tracking-widest mb-1">Meetings</p>
                    <p className="text-5xl font-black dark:text-white text-[var(--text-color)] drop-shadow-md">{stats.meetings}</p>
                  </div>
                </div>

                <div className="dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/10 backdrop-blur-xl p-8 rounded-[35px] shadow-lg group hover:bg-[var(--accent-color)]/5 transition-all duration-500 relative">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-black flex items-center gap-2 dark:text-white text-slate-800 uppercase tracking-tighter">🏆 Execution Overview</h4>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] dark:text-indigo-300/40 text-[var(--accent-color)]/40 p-1 border dark:border-white/5 border-black/5 rounded-lg">System Unit 4.2</span>
                  </div>
                  <div 
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleSaveNotes(e.target.innerText)}
                    className="dark:text-indigo-100/90 text-slate-700 leading-relaxed mb-8 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 rounded-2xl p-4 bg-black/5 dark:bg-white/5 min-h-[100px] border border-transparent hover:border-[var(--accent-color)]/20 transition-all cursor-text whitespace-pre-wrap"
                    placeholder="Capture your strategic vision here..."
                  >
                    {project.notes || "No summary recorded for this system. Click to initialize strategic documentation."}
                  </div>
                  <div className="flex gap-4">
                     <span className="bg-[var(--accent-color)]/50 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-[var(--accent-color)]/30 text-white">Type: {project.type}</span>
                     <span className="dark:bg-white/10 bg-black/5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border dark:border-white/10 border-black/10 dark:text-indigo-300 text-[var(--text-color)]">Status: Active</span>
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              {activePage === "notes" && (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  <NotesEditor value={project.notes || ""} onSave={handleSaveNotes} />
                </div>
              )}

              {activePage === "task" && (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  <TaskSheetViewer taskSheet={project.taskSheet} onSave={(data) => handleSaveSheet("taskSheet", data)} toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
                </div>
              )}

              {activePage === "mom" && (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  <MultiTableViewer tablesData={project.mom} title="MOM" onSave={(data) => handleSaveSheet("mom", data)} toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
                </div>
              )}

              {activePage === "sod" && (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                  <MultiTableViewer tablesData={project.sod} title="SOD" onSave={(data) => handleSaveSheet("sod", data)} toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
                </div>
              )}

              {activePage === "dashboard" && (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                   <ProjectDashboard project={project} />
                </div>
              )}
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}

export default BookLayout;
