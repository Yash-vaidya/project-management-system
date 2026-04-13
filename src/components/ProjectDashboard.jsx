import React from "react";

function ProjectDashboard({ project }) {
  // Advanced Helper to calculate status metrics
  const getMetrics = (dataStr) => {
    if (!dataStr || typeof dataStr !== "string") return { percent: 0, counts: { total: 0, completed: 0, pending: 0, progress: 0, hold: 0 } };
    try {
      const parsed = JSON.parse(dataStr);
      if (!Array.isArray(parsed) || parsed.length === 0) return { percent: 0, counts: { total: 0, completed: 0, pending: 0, progress: 0, hold: 0 } };
      
      // Flatten data based on its structure
      let data = [];
      if (parsed[0] && typeof parsed[0] === 'object' && !Array.isArray(parsed[0]) && 'data' in parsed[0]) {
        // New Multi-table: [{name, data}, ...]
        parsed.forEach(table => {
          if (Array.isArray(table.data)) data.push(...table.data);
        });
      } else if (Array.isArray(parsed[0])) {
        // Old Multi-table: [[row, ...], ...]
        parsed.forEach(table => {
          if (Array.isArray(table)) data.push(...table);
        });
      } else {
        // Single flat table: [row, ...]
        data = parsed;
      }
      
      if (data.length === 0) return { percent: 0, counts: { total: 0, completed: 0, pending: 0, progress: 0, hold: 0 } };
      
      const counts = { total: data.length, completed: 0, pending: 0, progress: 0, hold: 0 };
      
      data.forEach(row => {
        const statusKey = Object.keys(row).find(k => k.toLowerCase().includes("status"));
        if (statusKey && row[statusKey]) {
          const val = row[statusKey].toString().trim().toLowerCase();
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
    <div className="card-saas p-8 flex flex-col items-center justify-center transition-all hover:translate-y-[-4px]">
      <div className="relative w-40 h-40 mb-6 font-bold">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r="72"
            className="fill-none stroke-[var(--border-color)] stroke-[8]"
          />
          <circle
            cx="80" cy="80" r="72"
            className="fill-none stroke-[var(--primary-color)] stroke-[8] transition-all duration-1000 ease-out"
            strokeDasharray="452.39"
            strokeDashoffset={452.39 - (452.39 * metrics.percent) / 100}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 4px rgba(85, 110, 230, 0.4))" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-[var(--text-primary)]">{metrics.percent}%</span>
          <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">{subLabel}</span>
        </div>
      </div>
      <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">{label}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Project Analytics</h3>
          <p className="text-sm text-[var(--text-secondary)] font-medium">View project progress and statistics.</p>
        </div>
        <div className="px-4 py-1.5 bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-[10px] font-bold rounded-full tracking-widest uppercase border border-[var(--primary-color)]/20">
          📊 Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderCircle(task, "TASKS", "Completed")}
        {renderCircle(sod, "SOD", "Completed")}
        {renderCircle(mom, "MOM", "Meetings")}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-saas p-6">
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-2">Total Tasks</p>
          <p className="text-2xl font-black text-[var(--text-primary)]">{task.counts.total}</p>
        </div>
        <div className="card-saas p-6">
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-2">In Progress</p>
          <p className="text-2xl font-black text-[var(--warning)]">{task.counts.progress + sod.counts.progress}</p>
        </div>
        <div className="card-saas p-6">
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-2">Completed</p>
          <p className="text-2xl font-black text-[var(--success)]">{task.counts.completed + sod.counts.completed}</p>
        </div>
        <div className="card-saas p-6">
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-2">On Hold</p>
          <p className="text-2xl font-black text-[var(--danger)]">{task.counts.hold + sod.counts.hold}</p>
        </div>
      </div>
    </div>
  );
}

export default ProjectDashboard;
