import { useState, useEffect } from "react";
import TaskSheetViewer from "./TaskSheetViewer";
import MultiTableViewer from "./MultiTableViewer";
import ProjectDashboard from "./ProjectDashboard";
import PDFViewer from "./PDFViewer";
import { useToast } from "../utils/ToastContext";

function BookLayout({ project, activePage, setActivePage, goBack, onDelete, onUpdateProject, toggleSidebar, isSidebarCollapsed }) {
  const [flash, setFlash] = useState(false);
  const [isIndexCollapsed, setIsIndexCollapsed] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [aboutText, setAboutText] = useState(project.about || "This project is being managed from the dashboard. Use the navigation to manage tasks, meetings and documents.");
  const { addToast } = useToast();

  // Trigger flash animation when activePage changes
  useEffect(() => {
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 300);
    return () => clearTimeout(timer);
  }, [activePage]);

  const handleSaveSheet = async (field, newData, options = {}) => {
    // newData may be a single table (array of rows) or an array of tables (array of arrays)
    const serialized = typeof newData === "string" ? newData : JSON.stringify(newData);
    await fetch(`http://localhost:5000/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: serialized }),
    });
    if (onUpdateProject) onUpdateProject({ ...project, [field]: serialized });
    if (!options.silent) {
      const fieldName = field === 'mom' ? 'MOM' : field === 'sod' ? 'SOD' : 'Task Sheet';
      addToast(`${fieldName} saved successfully`, "success");
    }
  };

  // Advanced Helper to calculate dynamic metrics for the Overview
  const calculateMetrics = (dataStr) => {
    if (!dataStr || typeof dataStr !== "string") return { total: 0, completed: 0, inProgress: 0 };
    try {
      const parsed = JSON.parse(dataStr);
      if (!Array.isArray(parsed)) return { total: 0, completed: 0, inProgress: 0 };
      
      let data = [];
      if (parsed[0] && typeof parsed[0] === 'object' && !Array.isArray(parsed[0]) && 'data' in parsed[0]) {
        parsed.forEach(table => { if (Array.isArray(table.data)) data.push(...table.data); });
      } else if (Array.isArray(parsed[0])) {
        parsed.forEach(table => { if (Array.isArray(table)) data.push(...table); });
      } else {
        data = parsed;
      }

      let completed = 0;
      let inProgress = 0;
      
      data.forEach(row => {
        if (!row || typeof row !== 'object') return;
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
    <>
    <div className="max-w-[1600px] mx-auto animate-fadeIn">
      {/* Detail Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button 
              onClick={goBack}
              className="p-2 hover:bg-[var(--bg-color)] rounded-lg text-[var(--text-secondary)] transition-all"
              title="Return to Library"
            >
              ⬅️
            </button>
            <h1 className="text-3xl font-black bg-gradient-to-r from-[#FF0080] to-[#7928CA] bg-clip-text text-transparent tracking-tighter uppercase">{project.name}</h1>
            <span className="px-2 py-0.5 bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-[10px] font-bold uppercase rounded tracking-widest">
              {project.type}
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-medium ml-10">Project ID: #{project.id}</p>
        </div>
        
        <div className="flex gap-3 ml-10 md:ml-0">
          <button 
            onClick={onUpdateProject}
            className="p-2 px-4 bg-[var(--primary-color)]/10 text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white rounded-lg text-[10px] font-bold uppercase transition-all"
          >
            ✏️ Edit Metadata
          </button>
          {onDelete && (
            <button 
              onClick={onDelete}
              className="p-2 px-4 bg-[var(--danger)]/10 text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white rounded-lg text-[10px] font-bold uppercase transition-all"
            >
              🗑️ Delete Project
            </button>
          )}
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Project Navigation (Vertical Tabs) */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: null, label: "Overview", icon: "📊" },
            { id: "task", label: "Tasks", icon: "📄" },
            { id: "sod", label: "SOD", icon: "🗓️" },
            { id: "mom", label: "MOM", icon: "📝" },
            { id: "notes", label: "Documents", icon: "📓" },
            { id: "dashboard", label: "Analytics", icon: "📈" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all font-bold uppercase tracking-widest text-[10px] ${
                activePage === item.id 
                  ? "bg-[var(--primary-color)] text-white shadow-lg shadow-[#556EE6]/20" 
                  : "bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-color)]"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          
          <div className="card-saas p-6 mt-8">
            <h4 className="text-[10px] font-black uppercase bg-gradient-to-r from-[#FF0080] to-[#7928CA] bg-clip-text text-transparent mb-4 tracking-tighter">Project Stats</h4>
            <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-[9px] font-bold mb-1">
                    <span>PROGRESS</span>
                    <span>{Math.round((stats.completed / (stats.total || 1)) * 100)}%</span>
                  </div>
                  <div className="w-full h-1 bg-[var(--border-color)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--primary-color)]" 
                      style={{ width: `${(stats.completed / (stats.total || 1)) * 100}%` }}
                    ></div>
                  </div>
               </div>
               <div className="flex justify-between items-center bg-[var(--bg-color)]/30 p-2 rounded">
                 <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">Total Items</span>
                 <span className="text-[10px] font-black text-[var(--text-primary)]">{stats.total}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Modular Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {!activePage && (
            <div className="space-y-8 animate-fadeIn">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card-saas p-6 border-l-4 border-l-[var(--primary-color)]">
                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1">Total Tasks</p>
                    <p className="text-3xl font-black bg-gradient-to-r from-[#FF0080] to-[#7928CA] bg-clip-text text-transparent">{stats.total}</p>
                  </div>
                  <div className="card-saas p-6 border-l-4 border-l-[var(--success)]">
                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1">Completed</p>
                    <p className="text-3xl font-black bg-gradient-to-r from-[#FF0080] to-[#7928CA] bg-clip-text text-transparent">{stats.completed}</p>
                  </div>
                  <div className="card-saas p-6 border-l-4 border-l-[var(--warning)]">
                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1">Meetings</p>
                    <p className="text-3xl font-black bg-gradient-to-r from-[#FF0080] to-[#7928CA] bg-clip-text text-transparent">{stats.meetings}</p>
                  </div>
               </div>

               <div className="card-saas p-8 min-h-[400px] flex flex-col justify-center items-center text-center relative group">
                   <div className="w-20 h-20 bg-[var(--primary-color)]/10 rounded-full flex items-center justify-center text-4xl mb-6">📋</div>
                   <h3 className="text-2xl font-black bg-gradient-to-r from-[#FF0080] to-[#7928CA] bg-clip-text text-transparent mb-2 uppercase">Project Overview</h3>
                  
                  {isEditingAbout ? (
                    <div className="w-full max-w-2xl mb-8 flex flex-col gap-3">
                      <textarea 
                        value={aboutText}
                        onChange={(e) => setAboutText(e.target.value)}
                        className="w-full h-48 p-4 rounded-xl resize-none outline-none font-medium text-black bg-white shadow-inner focus:ring-4 focus:ring-[var(--primary-color)]/30 transition-all text-sm leading-relaxed"
                        placeholder="Enter project details..."
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setIsEditingAbout(false)}
                          className="px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase tracking-wide transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => {
                            setIsEditingAbout(false);
                            handleSaveSheet("about", aboutText);
                          }}
                          className="btn-primary py-2 px-6 text-xs shadow-none"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-2xl mb-8 relative">
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                        {aboutText}
                      </p>
                      <button 
                        onClick={() => setIsEditingAbout(true)}
                        className="absolute -right-8 -top-2 p-2 opacity-0 group-hover:opacity-100 bg-[var(--bg-color)] text-[var(--text-secondary)] hover:text-[var(--primary-color)] font-bold text-[10px] uppercase rounded transition-all shadow-sm"
                      >
                        ✏️ Edit About
                      </button>
                    </div>
                  )}

                  {!isEditingAbout && (
                    <button 
                      onClick={() => setIsEditingAbout(true)}
                      className="btn-primary px-8"
                    >
                      ✏️ Edit About
                    </button>
                  )}
               </div>
            </div>
          )}

          {activePage === "notes" && (
            <div className="animate-fadeIn card-saas overflow-hidden p-0 h-[700px]">
              <PDFViewer 
                data={project.notes} 
                title={`${project.name} Documentation`} 
                onUpload={(pdfData) => handleSaveSheet("notes", pdfData)}
              />
            </div>
          )}

          {activePage === "task" && (
            <div className="animate-fadeIn">
              <TaskSheetViewer taskSheet={project.taskSheet} onSave={(data) => handleSaveSheet("taskSheet", data)} toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
            </div>
          )}

          {activePage === "mom" && (
            <div className="animate-fadeIn">
              <MultiTableViewer tablesData={project.mom} title="MOM" onSave={(data) => handleSaveSheet("mom", data)} toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
            </div>
          )}

          {activePage === "sod" && (
            <div className="animate-fadeIn">
              <MultiTableViewer tablesData={project.sod} title="SOD" onSave={(data) => handleSaveSheet("sod", data)} toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
            </div>
          )}

          {activePage === "dashboard" && (
            <div className="animate-fadeIn">
               <ProjectDashboard project={project} />
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Metadata Edit Modal */}
    {isEditingMetadata && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
        <div className="card-saas p-0 w-full max-w-[400px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)] flex justify-between items-center">
            <h3 className="text-lg font-black bg-gradient-to-r from-[#FF0080] to-[#7928CA] bg-clip-text text-transparent tracking-tight uppercase">Edit Project</h3>
            <button onClick={() => setIsEditingMetadata(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">✕</button>
          </div>
          
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const name = e.target.projectName.value;
              const type = e.target.projectType.value;
              try {
                await fetch(`http://localhost:5000/projects/${project.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, type }),
                });
                if (onUpdateProject) onUpdateProject({ ...project, name, type });
                addToast("Project updated successfully", "success");
                setIsEditingMetadata(false);
              } catch (err) {
                addToast("Failed to update project", "error");
              }
            }} 
            className="p-6 space-y-5"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Project Name</label>
              <input 
                name="projectName"
                type="text" 
                defaultValue={project.name}
                className="input-saas w-full h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Project Type</label>
              <select 
                name="projectType"
                defaultValue={project.type}
                className="input-saas w-full h-11 bg-[var(--card-bg)]"
              >
                <option value="mern">MERN Stack</option>
                <option value="dotnet">.NET Development</option>
                <option value="website">Websites</option>
              </select>
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsEditingMetadata(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:bg-[var(--bg-color)] rounded transition-colors"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}

export default BookLayout;
