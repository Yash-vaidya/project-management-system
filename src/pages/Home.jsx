import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { calculateMetrics } from "../utils/metrics";
import { useToast } from "../utils/ToastContext";

function Home() {
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchProjects = () => {
    fetch("http://localhost:5000/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const deleteProject = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete project "${name}"? This action cannot be undone.`)) {
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

  // Calculate metrics
  const totalProjects = projects.length;
  let totalTasks = 0;
  let completedTasks = 0;

  projects.forEach((p) => {
    const metrics = calculateMetrics(p.taskSheet);
    totalTasks += metrics.total;
    completedTasks += metrics.completed;
  });

  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const typeMap = {
    mern: "MERN Stack",
    dotnet: ".NET Development",
    website: "Websites"
  };

  const chartData = projects.slice(0, 10).map(p => {
    const metrics = calculateMetrics(p.taskSheet);
    return { 
      id: p.id,
      name: p.name,
      type: p.type, 
      progress: metrics.total === 0 ? 0 : Math.round((metrics.completed / metrics.total) * 100)
    };
  });

  return (
    <div className="max-w-[1600px] mx-auto animate-fadeIn p-4">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight uppercase">Dashboard</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium tracking-wide">Welcome: Yash Vaidya</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/add-project")} className="btn-primary flex items-center gap-2 shadow-lg shadow-[#556EE6]/30">
            <span>➕</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Add New Project</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div className="card-saas p-6 flex items-center gap-4 hover:border-[var(--primary-color)] transition-colors">
          <div className="w-12 h-12 bg-[#556EE6]/10 rounded-lg flex items-center justify-center text-xl shadow-inner">📁</div>
          <div>
            <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Total Projects</p>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-1">{totalProjects}</h3>
          </div>
        </div>
        <div className="card-saas p-6 flex items-center gap-4 hover:border-[var(--primary-color)] transition-colors">
          <div className="w-12 h-12 bg-[var(--primary-color)]/10 rounded-lg flex items-center justify-center text-xl shadow-inner">📊</div>
          <div>
            <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Total Tasks</p>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-1">{totalTasks}</h3>
          </div>
        </div>
        <div className="card-saas p-6 flex items-center gap-4 hover:border-[var(--primary-color)] transition-colors">
          <div className="w-12 h-12 bg-[var(--success)]/10 rounded-lg flex items-center justify-center text-xl shadow-inner">📈</div>
          <div>
            <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Overall Progress</p>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-1">{progressPercent}%</h3>
          </div>
        </div>
        <div className="card-saas p-6 flex items-center gap-4 hover:border-[var(--primary-color)] transition-colors">
          <div className="w-12 h-12 bg-[var(--warning)]/10 rounded-lg flex items-center justify-center text-xl shadow-inner">⚡</div>
          <div>
            <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Status</p>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-1">Active</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Projects Table */}
        <div className="lg:col-span-12 space-y-8">
          <div className="card-saas overflow-hidden">
            <div className="px-8 py-5 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30 flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">All Projects</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest bg-[var(--bg-color)]/50 border-b border-[var(--border-color)]">
                    <th className="px-8 py-4">Project Name</th>
                    <th className="px-8 py-4">Type</th>
                    <th className="px-8 py-4">Progress</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {chartData.map((proj, idx) => (
                    <tr key={idx} className="hover:bg-[var(--bg-color)]/20 transition-all group cursor-default">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-[var(--primary-color)] text-white rounded font-black text-[10px] flex items-center justify-center shadow-md">
                            {proj.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--primary-color)] transition-colors">{proj.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-tight">{typeMap[proj.type] || 'MERN Stack'}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="w-40 flex items-center gap-4">
                          <div className="flex-1 h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${proj.progress > 80 ? 'bg-[var(--success)]' : 'bg-[var(--primary-color)]'}`}
                              style={{ width: `${proj.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-black text-[var(--text-primary)]">{proj.progress}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${proj.progress > 80 ? 'bg-[var(--success)] animate-pulse' : 'bg-[var(--warning)]'}`}></div>
                           <span className={`text-[9px] font-black uppercase tracking-widest ${proj.progress > 80 ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                             {proj.progress > 80 ? 'Completed' : 'In Progress'}
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/project/${proj.id}`} 
                          className="p-2 px-4 bg-[var(--bg-color)] hover:bg-[var(--primary-color)] hover:text-white rounded text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          View
                        </Link>
                        <button 
                          onClick={() => setEditingProject({ id: proj.id, name: proj.name, type: proj.type })}
                          className="p-2 bg-[var(--bg-color)] hover:bg-[var(--primary-color)] hover:text-white rounded text-[10px] transition-all"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => deleteProject(proj.id, proj.name)}
                          className="p-2 bg-[var(--bg-color)] hover:bg-red-500/10 hover:text-red-500 rounded text-[10px] transition-all"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalProjects === 0 && (
              <div className="p-16 text-center">
                <p className="text-[var(--text-secondary)] text-sm font-medium italic opacity-50 tracking-wide">No projects found. Click "Add New Project" to create one.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="card-saas p-0 w-full max-w-[400px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-[var(--bg-color)]/50 border-b border-[var(--border-color)] flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Edit Project</h3>
              <button onClick={() => setEditingProject(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">✕</button>
            </div>
            
            <form onSubmit={updateProject} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Project Name</label>
                <input 
                  type="text" 
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                  className="input-saas w-full h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Project Type</label>
                <select 
                  value={editingProject.type}
                  onChange={(e) => setEditingProject({...editingProject, type: e.target.value})}
                  className="input-saas w-full h-12 bg-[var(--card-bg)] cursor-pointer"
                >
                  <option value="mern">MERN Stack</option>
                  <option value="dotnet">.NET Development</option>
                  <option value="website">Websites</option>
                </select>
              </div>
              
              <div className="pt-6 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:bg-[var(--bg-color)] rounded transition-all"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary shadow-xl shadow-[#556EE6]/20">
                  <span className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em]">Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
