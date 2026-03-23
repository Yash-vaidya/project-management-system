import React from "react";

function ProjectDashboard({ project }) {
  // Advanced Helper to calculate status metrics
  const getMetrics = (dataStr) => {
    if (!dataStr || typeof dataStr !== "string") return { percent: 0, counts: { total: 0, completed: 0, pending: 0, progress: 0, hold: 0 } };
    try {
      const data = JSON.parse(dataStr);
      if (!Array.isArray(data) || data.length === 0) return { percent: 0, counts: { total: 0, completed: 0, pending: 0, progress: 0, hold: 0 } };
      
      const counts = { total: data.length, completed: 0, pending: 0, progress: 0, hold: 0 };
      
      data.forEach(row => {
        const statusKey = Object.keys(row).find(k => k.toLowerCase().includes("status"));
        if (statusKey && row[statusKey]) {
          const val = row[statusKey].toString().trim().toLowerCase();
          // Extremely robust matching for "completed"
          const isCompleted = val.startsWith("complet") || val.startsWith("compet") || ["done", "success", "finished", "ok"].includes(val);
          const isInProgress = val.includes("progress") || val.includes("ongoing") || val.includes("work");
          const isOnHold = val.includes("hold") || val.includes("pause") || val.includes("block");

          if (isCompleted) counts.completed++;
          else if (isInProgress) counts.progress++;
          else if (isOnHold) counts.hold++;
          else counts.pending++;
        } else {
          counts.pending++;
        }
      });
      
      return { 
        percent: Math.round((counts.completed / data.length) * 100),
        counts 
      };
    } catch { return { percent: 0, counts: { total: 0, completed: 0, pending: 0, progress: 0, hold: 0 } }; }
  };

  const sod = getMetrics(project.sod);
  const task = getMetrics(project.taskSheet);
  const mom = getMetrics(project.mom);



  const renderCircle = (metrics, label, subLabel) => (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64" cy="64" r="58"
            className="fill-none dark:stroke-white/5 stroke-black/5 stroke-[8]"
          />
          <circle
            cx="64" cy="64" r="58"
            className="fill-none stroke-[var(--accent-color)] stroke-[8] transition-all duration-1000 ease-out"
            strokeDasharray="364.4"
            strokeDashoffset={364.4 - (364.4 * metrics.percent) / 100}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black dark:text-white text-[var(--text-color)]">{metrics.percent}%</span>
          <span className="text-[8px] font-black dark:text-indigo-300/60 text-[var(--text-color)] uppercase tracking-widest">{subLabel}</span>
        </div>
      </div>
      <p className="text-[10px] font-black dark:text-white/60 text-[var(--text-color)]/80 uppercase tracking-[0.2em]">{label}</p>
    </div>
  );

  return (
    <div className="mt-12 p-8 dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/10 rounded-[40px] backdrop-blur-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-2xl font-black dark:text-white text-[var(--text-color)] tracking-tighter uppercase">Project Analytics</h3>
          <p className="dark:text-indigo-300/40 text-[var(--text-color)]/80 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Real-time execution metrics</p>
        </div>
        <div className="px-4 py-2 bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/30 rounded-full dark:text-indigo-300 text-[var(--accent-color)] text-[10px] font-black uppercase tracking-widest uppercase">
          Node Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {renderCircle(sod, "SOD", "Daily Progress")}
        {renderCircle(mom, "MOM", "Meeting Sync")}
        {renderCircle(task, "TASK", "Task Lifecycle")}
      </div>

      <div className="mt-10 pt-6 border-t dark:border-white/5 border-black/5 flex items-center gap-4 dark:text-indigo-300/30 text-[var(--text-color)]/20">
        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Telemetry Phase 4.2</span>
        <div className="flex-1 h-[1px] dark:bg-white/5 bg-black/5"></div>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] font-black">{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export default ProjectDashboard;
