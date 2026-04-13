import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { calculateMetrics } from "../utils/metrics";
import { useToast } from "../utils/ToastContext";

function Projects({ toggleSidebar, isSidebarCollapsed }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [pageMap, setPageMap] = useState({ mern: 0, dotnet: 0, website: 0 });
  const [draggedOverShelf, setDraggedOverShelf] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const { addToast } = useToast();

  const ITEMS_PER_PAGE = 6;

  const fetchProjects = () => {
    fetch("http://localhost:5000/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const deleteProject = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete project "${name}"?`)) {
      try {
        await fetch(`http://localhost:5000/projects/${id}`, { method: "DELETE" });
        addToast(`Project "${name}" deleted successfully`, "success");
        fetchProjects();
      } catch (e) {
        addToast("Failed to delete project", "error");
      }
    }
  };

  const updateProject = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:5000/projects/${editingProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingProject.name, type: editingProject.type }),
      });
      addToast("Project updated successfully", "success");
      setEditingProject(null);
      fetchProjects();
    } catch (e) {
      addToast("Failed to update project", "error");
    }
  };

  const handlePageChange = (catId, targetPage) => {
    setPageMap(prev => ({
      ...prev,
      [catId]: targetPage
    }));
  };
  const handleDragOver = (e, catId) => {
    e.preventDefault();
    setDraggedOverShelf(catId);
  };

  const handleDragLeave = () => {
    setDraggedOverShelf(null);
  };

  const handleDrop = async (e, catId) => {
    e.preventDefault();
    setDraggedOverShelf(null);
    const projectId = e.dataTransfer.getData("projectId");
    if (!projectId) return;

    const project = projects.find(p => p.id.toString() === projectId.toString());
    if (!project || project.type === catId) return;

    try {
      // Optimistically update UI
      const updatedProject = { ...project, type: catId };
      setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
      
      const response = await fetch(`http://localhost:5000/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: catId })
      });

      if (!response.ok) throw new Error("Failed to update project category");
      
      addToast(`Project moved to ${categories.find(c => c.id === catId).name}`, "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to move project", "error");
    }
  };

  const categories = [
    { id: "mern", name: "MERN Stack", icon: "⚛️" },
    { id: "dotnet", name: ".NET Development", icon: "🪟" },
    { id: "website", name: "Websites", icon: "🌐" }
  ];

  return (
    <div className="max-w-[1600px] mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight uppercase">All Projects</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium tracking-wide">Total: {projects.length} projects</p>
        </div>
      </div>

      <div className="flex flex-col gap-12">
          {categories.map((cat) => {
            const catProjects = projects.filter(p => p.type === cat.id).map(p => {
               const metrics = calculateMetrics(p.taskSheet);
               return {
                 ...p,
                 progress: metrics.total === 0 ? 0 : Math.round((metrics.completed / metrics.total) * 100)
               };
            });
            const totalPages = Math.ceil(catProjects.length / ITEMS_PER_PAGE);
            const currentPage = pageMap[cat.id];
            const paginatedProjects = catProjects.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

            return (
              <div 
                key={cat.id} 
                className={`relative group p-4 rounded-xl border-2 transition-all ${draggedOverShelf === cat.id ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5' : 'border-transparent'}`}
                onDragOver={(e) => handleDragOver(e, cat.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, cat.id)}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between mb-6 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl grayscale group-hover:grayscale-0 transition-all duration-300">{cat.icon}</span>
                    <div>
                      <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">
                        {cat.name}
                      </h2>
                      <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter mt-0.5">{catProjects.length} projects</p>
                    </div>
                  </div>
                </div>

                {/* Project Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {paginatedProjects.length > 0 ? (
                    paginatedProjects.map((proj) => (
                      <div 
                        key={proj.id} 
                        onClick={() => navigate(`/project/${proj.id}`)}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("projectId", proj.id.toString())}
                        className="card-saas p-0 group cursor-pointer flex flex-col h-full hover:-translate-y-1"
                      >
                        <div className="p-5 flex-1">
                           <div className="flex justify-between items-start mb-4">
                             <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-sm ${proj.progress > 80 ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--warning)]/10 text-[var(--warning)]'}`}>
                               {cat.icon}
                             </div>
                             <div className="flex flex-col items-end gap-2">
                               <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase bg-[var(--bg-color)] px-2 py-1 rounded tracking-tighter shadow-sm">ID: {proj.id}</span>
                               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                 <button 
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setEditingProject({ id: proj.id, name: proj.name, type: proj.type });
                                   }}
                                   className="p-1 px-2 bg-[var(--bg-color)] hover:bg-[var(--primary-color)] hover:text-white rounded text-[10px] transition-all"
                                   title="Edit"
                                 >
                                   ✏️
                                 </button>
                                 <button 
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     deleteProject(proj.id, proj.name);
                                   }}
                                   className="p-1 px-2 bg-[var(--bg-color)] hover:bg-red-500/10 hover:text-red-500 rounded text-[10px] transition-all"
                                   title="Delete"
                                 >
                                   🗑️
                                 </button>
                               </div>
                             </div>
                           </div>
                           <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--primary-color)] transition-colors line-clamp-1">{proj.name}</h3>
                           <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-1 uppercase tracking-tight">{categories.find(c => c.id === proj.type)?.name || 'MERN Stack'}</p>
                        </div>
                        
                        <div className="px-5 py-4 border-t border-[var(--border-color)] bg-[var(--bg-color)]/20">
                           <div className="flex justify-between items-center mb-2">
                             <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">Progress</span>
                             <span className="text-[10px] font-black text-[var(--text-primary)]">{proj.progress}%</span>
                           </div>
                           <div className="w-full h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
                             <div 
                               className={`h-full transition-all duration-1000 ${proj.progress > 80 ? 'bg-[var(--success)]' : 'bg-[var(--primary-color)]'}`} 
                               style={{ width: `${proj.progress}%` }}
                             ></div>
                           </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-[var(--border-color)] rounded-xl">
                      <p className="text-[var(--text-secondary)] text-sm font-medium italic">No projects in this category yet.</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(cat.id, i)}
                        className={`w-8 h-8 rounded-md text-[10px] font-bold transition-all ${
                          currentPage === i 
                            ? "bg-[var(--primary-color)] text-white shadow-md shadow-[#556EE6]/20" 
                            : "bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-color)]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      {/* Project Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="card-saas p-0 w-full max-w-[400px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight uppercase">Edit Project</h3>
              <button onClick={() => setEditingProject(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">✕</button>
            </div>
            
            <form onSubmit={updateProject} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Project Name</label>
                <input 
                  type="text" 
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                  className="input-saas w-full h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Project Type</label>
                <select 
                  value={editingProject.type}
                  onChange={(e) => setEditingProject({...editingProject, type: e.target.value})}
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
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:bg-[var(--bg-color)] rounded transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
