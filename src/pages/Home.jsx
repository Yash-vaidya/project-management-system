import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  // Compute metrics dynamically
  const totalProjects = projects.length;

  let totalTasks = 0;
  let completedTasks = 0;

  projects.forEach((p) => {
    if (p.sod && typeof p.sod === "string") {
      try {
        const parsed = JSON.parse(p.sod);
        if (Array.isArray(parsed)) {
          totalTasks += parsed.length;
          parsed.forEach((row) => {
            const statusKey = Object.keys(row).find((k) => k.toLowerCase().includes("status"));
            if (statusKey && row[statusKey]) {
              const val = row[statusKey].toString().trim().toLowerCase();
              if (val.startsWith("complet") || val.startsWith("compet") || ["done", "success", "finished", "ok"].includes(val)) {
                completedTasks++;
              }
            }
          });
        }
      } catch {
        // ignore parsing errors
      }
    }
  });

  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Dynamic Chart Data mapping from SOD table
  const chartData = projects.map(p => {
      let tTasks = 0;
      let cTasks = 0;
      
      if (p.sod && typeof p.sod === "string") {
        try {
          const parsed = JSON.parse(p.sod);
          if (Array.isArray(parsed)) {
            tTasks = parsed.length;
            parsed.forEach((row) => {
              const statusKey = Object.keys(row).find((k) => k.toLowerCase().includes("status"));
              if (statusKey && row[statusKey]) {
                const val = row[statusKey].toString().trim().toLowerCase();
                if (val.startsWith("complet") || val.startsWith("compet") || ["done", "success", "finished", "ok"].includes(val)) {
                  cTasks++;
                }
              }
            });
          }
        } catch {
          // Ignore parsing errors
        }
      }
      return { 
        name: p.name, 
        progress: tTasks === 0 ? 0 : Math.round((cTasks / tTasks) * 100)
      };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col items-stretch h-full overflow-y-auto transition-colors duration-300">
      <div className="mb-10">
        <h1 className="text-5xl font-extrabold capitalize drop-shadow-lg mb-2 dark:text-white text-[var(--text-color)] uppercase tracking-tighter">Global Overview</h1>
        <p className="dark:text-indigo-200 text-black/40 text-lg font-medium">Your entire project ecosystem at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Total Projects */}
        <div className="bg-black/5 dark:bg-white/5 border dark:border-white/10 border-black/5 backdrop-blur-xl p-6 rounded-3xl shadow-xl flex flex-col justify-center transition-all hover:bg-[var(--accent-color)]/5 group">
          <p className="dark:text-indigo-300/60 text-[var(--text-color)]/60 text-[10px] font-black uppercase tracking-widest mb-2">Total Projects</p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black dark:text-white text-[var(--text-color)] drop-shadow-md group-hover:text-[var(--accent-color)] transition-colors uppercase">{totalProjects}</span>
            <span className="dark:text-indigo-300/30 text-[var(--text-color)]/30 font-black text-[10px] mb-1 uppercase tracking-widest">Active Units</span>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-black/5 dark:bg-white/5 border dark:border-white/10 border-black/5 backdrop-blur-xl p-6 rounded-3xl shadow-xl flex flex-col justify-center transition-all hover:bg-[var(--accent-color)]/5 group">
          <p className="dark:text-indigo-300/60 text-[var(--text-color)]/60 text-[10px] font-black uppercase tracking-widest mb-2">Global Tasks</p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black dark:text-white text-[var(--text-color)] drop-shadow-md group-hover:text-[var(--accent-color)] transition-colors uppercase">{totalTasks}</span>
            <span className="dark:text-indigo-300/30 text-[var(--text-color)]/30 font-black text-[10px] mb-1 uppercase tracking-widest">In Network</span>
          </div>
        </div>

        {/* Global Progress */}
        <div className="bg-black/5 dark:bg-white/5 border dark:border-white/10 border-black/5 backdrop-blur-xl p-6 rounded-3xl shadow-xl flex flex-col justify-center col-span-1 md:col-span-2 transition-all hover:bg-[var(--accent-color)]/5">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="dark:text-indigo-300/60 text-[var(--text-color)]/60 text-[10px] font-black uppercase tracking-widest mb-1">Overall System Execution (SOD)</p>
              <p className="text-4xl font-black dark:text-white text-[var(--text-color)] drop-shadow-md">{progressPercent}%</p>
            </div>
            <p className="dark:text-indigo-300/40 text-[var(--text-color)]/40 text-[9px] font-black text-right uppercase tracking-widest">{completedTasks} / {totalTasks} Nodes Synchronized</p>
          </div>
          <div className="w-full bg-slate-300/30 dark:bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="bg-[var(--accent-color)] h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(34,197,94,0.4)]" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-black mb-6 tracking-widest dark:text-white/80 text-slate-700 uppercase">📈 Terminal Execution Matrix (SOD)</h2>
      
      {/* 📊 Circle Progress Matrix (SOD) */}
      <div className="dark:bg-white/5 bg-black/5 border dark:border-white/10 border-black/10 rounded-[40px] p-10 backdrop-blur-3xl shadow-2xl mb-12">
        <div className="flex justify-between mb-8 border-b dark:border-white/5 border-black/5 pb-4">
          <span className="text-[10px] dark:text-indigo-300/40 text-[var(--text-color)]/60 tracking-[0.4em] uppercase font-black">Execution Vectors: SOD Node Matrix</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
          {chartData.map((proj, idx) => (
            <div key={idx} className="flex flex-col items-center group transition-transform hover:scale-110 duration-500">
               <div className="relative w-36 h-36 mb-6">
                 <svg className="w-full h-full -rotate-90">
                   <circle
                     cx="72" cy="72" r="66"
                     className="fill-none dark:stroke-white/5 stroke-black/5 stroke-[10]"
                   />
                   <circle
                     cx="72" cy="72" r="66"
                     className="fill-none stroke-[var(--accent-color)] stroke-[10] transition-all duration-1000 ease-out"
                     strokeDasharray="414.7"
                     strokeDashoffset={414.7 - (414.7 * proj.progress) / 100}
                     strokeLinecap="round"
                   />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-3xl font-black dark:text-white text-[var(--text-color)]">{proj.progress}%</span>
                   <span className="text-[9px] font-black dark:text-indigo-300/30 text-[var(--text-color)]/30 uppercase tracking-widest mt-1">Vector</span>
                 </div>
               </div>
               <h3 className="text-[11px] font-black dark:text-white text-[var(--text-color)]/80 uppercase tracking-tighter text-center max-w-[120px] truncate group-hover:text-[var(--accent-color)] transition-colors">
                 {proj.name}
               </h3>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12 text-[9px] dark:text-indigo-300/30 text-[var(--text-color)]/20 tracking-[0.6em] uppercase font-black border-t dark:border-white/5 border-black/5 pt-6">
          System Core Telemetry (Baseline 2.1)
        </div>
      </div>
      
      {totalProjects === 0 && (
        <div className="mt-8 text-center p-8 bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-indigo-200 text-xl mb-4">Your database is completely fresh, so the chart above is currently showing fake example data.</p>
          <Link to="/add-project" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition">
            Start Your First Project
          </Link>
        </div>
      )}
    </div>
  );
}

export default Home;
