  import React from "react";

function ProjectBook({ project, onSelect, onDelete }) {
  // Theme-aware color for the book spine
  const colorClass = "dark:from-slate-800 dark:to-indigo-950 from-black/80 to-black/90 text-white";

  // Calculate progress from SOD data
  let progress = 0;
  if (project.sod && typeof project.sod === "string") {
    try {
      const parsed = JSON.parse(project.sod);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const completed = parsed.filter(row => {
          const statusKey = Object.keys(row).find(k => k.toLowerCase().includes("status"));
          if (statusKey && row[statusKey]) {
            const val = row[statusKey].toString().trim().toLowerCase();
            return val === "completed" || val === "done" || val === "success";
          }
          return false;
        }).length;
        progress = Math.round((completed / parsed.length) * 100);
      }
    } catch {
      // Ignore parsing errors
    }
  }

  return (
    <div className="group relative flex flex-col items-center">
      {/* Book Container */}
      <div 
        onClick={() => onSelect(project)}
        className="relative w-14 h-48 md:w-16 md:h-56 cursor-pointer transition-all duration-500 ease-out 
                   transform origin-bottom hover:-translate-y-4 hover:rotate-2 group-hover:z-20"
      >
        {/* Book Spine */}
        <div className={`absolute inset-0 bg-gradient-to-b ${colorClass} rounded-sm shadow-[4px_0_15px_rgba(0,0,0,0.6)] 
                         border-l border-white/10 flex flex-col items-center justify-between py-5 px-1 overflow-hidden transition-all duration-300 group-hover:shadow-[10px_0_25px_rgba(0,0,0,0.7)]`}>
          
          {/* Progress Indicator (Vertical fill) */}
          <div className="absolute left-0 bottom-0 w-1 bg-green-500/40 transition-all duration-1000" style={{ height: `${progress}%` }}></div>
          <div className="absolute left-0 bottom-0 w-[1px] h-full bg-white/5"></div>

          {/* Decorative lines at top */}
          <div className="w-full flex flex-col gap-1 px-1 opacity-20">
            <div className="h-[1px] bg-white w-full"></div>
            <div className="h-[1px] bg-white w-full"></div>
          </div>

          {/* Vertical Title */}
          <h3 className="text-white text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap 
                         [writing-mode:vertical-rl] rotate-180 drop-shadow-md py-4 overflow-hidden truncate max-h-36 opacity-80 group-hover:opacity-100">
            {project.name}
          </h3>

          {/* Progress Label at bottom */}
          <div className="w-full flex flex-col items-center gap-1 px-1 z-10">
             <span className="text-[7px] font-bold text-white/40 mb-1">PROG: {progress}%</span>
             <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]/40 border border-[var(--accent-color)]/30"></div>
             <div className="h-[1px] bg-white/10 w-full mt-1"></div>
          </div>
        </div>

        {/* Shadow on base */}
        <div className="absolute -bottom-1 left-1 right-1 h-2 bg-black/60 blur-md rounded-full scale-x-90 group-hover:scale-x-110 transition-transform"></div>
      </div>

      {/* Delete Icon (Professionally styled) */}
       {onDelete && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
          }}
          className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-red-500/10 hover:bg-red-500/30 p-2 rounded-xl border border-red-500/20 text-[10px] text-red-300 z-30 shadow-xl backdrop-blur-md"
          title="Delete Project"
        >
          🗑️
        </button>
      )}
    </div>
  );
}

export default ProjectBook;
