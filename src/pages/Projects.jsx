import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { calculateMetrics } from "../utils/metrics";
import { useToast } from "../utils/ToastContext";

function Projects() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedOverShelf, setDraggedOverShelf] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const ITEMS_PER_PAGE = 12;

  const categories = [
    { id: "mern", name: "MERN Stack", icon: "⚛️", gradient: "from-[#FF0080] to-[#7928CA]" },
    { id: "dotnet", name: ".NET Development", icon: "🪟", gradient: "from-[#FF0080] to-[#7928CA]" },
    { id: "website", name: "Websites", icon: "🌐", gradient: "from-[#FF0080] to-[#7928CA]" },
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:5000/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const deleteProject = async (id, name) => {
    if (currentUser?.role !== 'Super Admin') {
      addToast('Only Super Admin can delete projects', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/projects/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      addToast("Project deleted successfully", "success");
      fetchProjects();
    } catch (err) {
      console.error(err);
      addToast("Failed to delete project", "error");
    }
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

    const project = projects.find((p) => p.id.toString() === projectId.toString());
    if (!project || project.type === catId) return;

    try {
      const updatedProject = { ...project, type: catId };
      setProjects((prev) =>
        prev.map((p) => (p.id.toString() === projectId.toString() ? updatedProject : p))
      );

      const res = await fetch(`http://localhost:5000/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: catId }),
      });

      if (!res.ok) throw new Error("Failed to update project category");

      addToast(`Project moved to ${catId}`, "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to move project", "error");
    }
  };

  const canEditProject = () => currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin';
  const canDeleteProject = () => currentUser?.role === 'Super Admin';

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[var(--primary-color)]/30 border-t-[var(--primary-color)] rounded-full animate-spin mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto animate-fadeIn p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-[#FF0080] to-[#7928CA] bg-clip-text text-transparent tracking-tighter uppercase">
            All Projects
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium tracking-wide">
            Total: {projects.length} projects
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-center">
          {error}
          <button onClick={fetchProjects} className="ml-3 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {categories.map((cat) => {
          const catProjects = projects
            .filter((p) => p.type === cat.id)
            .map((p) => {
              const metrics = calculateMetrics(p.taskSheet);
              return {
                ...p,
                progress:
                  metrics.total === 0
                    ? 0
                    : Math.round((metrics.completed / metrics.total) * 100),
              };
            });

          return (
            <div
              key={cat.id}
              className={`relative group p-4 rounded-xl border-2 transition-all ${
                draggedOverShelf === cat.id
                  ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5"
                  : "border-transparent"
              }`}
              onDragOver={(e) => handleDragOver(e, cat.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, cat.id)}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3 px-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl grayscale group-hover:grayscale-0 transition-all duration-300">
                    {cat.icon}
                  </span>
                  <div>
                    <h2
                      className={`text-xs font-black bg-gradient-to-r ${cat.gradient} bg-clip-text text-transparent uppercase tracking-widest`}
                    >
                      {cat.name}
                    </h2>
                    <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter mt-0.5">
                      {catProjects.length} projects
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {catProjects.length > 0 ? (
                  catProjects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => navigate(`/project/${proj.id}`)}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("projectId", proj.id.toString())
                      }
                      className="card-saas p-0 group cursor-pointer flex flex-col h-full hover:-translate-y-1"
                    >
                      <div className="p-3 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-sm ${
                              proj.progress > 80
                                ? "bg-[var(--success)]/10 text-[var(--success)]"
                                : "bg-[var(--warning)]/10 text-[var(--warning)]"
                            }`}
                          >
                            {cat.icon}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase bg-[var(--bg-color)] px-2 py-1 rounded tracking-tighter shadow-sm">
                              ID: {proj.id}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              {canEditProject() && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingProject({
                                      id: proj.id,
                                      name: proj.name,
                                      type: proj.type,
                                    });
                                  }}
                                  className="p-1 px-2 bg-[var(--bg-color)] hover:bg-[var(--primary-color)] hover:text-white rounded text-[10px] transition-all"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                              )}
                              {canDeleteProject() && (
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
                              )}
                            </div>
                          </div>
                        </div>
                        <h3 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--primary-color)] transition-colors line-clamp-1">
                          {proj.name}
                        </h3>
                        <p className="text-[9px] text-[var(--text-secondary)] font-medium mt-0.5 uppercase tracking-tighter">
                          {cat.name}
                        </p>
                      </div>

                      <div className="px-3 py-2 border-t border-[var(--border-color)] bg-[var(--bg-color)]/20">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase">
                            Progress
                          </span>
                          <span className="text-[9px] font-black text-[var(--text-primary)]">
                            {proj.progress}%
                          </span>
                        </div>
                        <div className="w-full h-1 bg-[var(--border-color)] rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${
                              proj.progress > 80
                                ? "bg-[var(--success)]"
                                : "bg-[var(--primary-color)]"
                            }`}
                            style={{ width: `${proj.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-[var(--border-color)] rounded-xl">
                    <p className="text-[var(--text-secondary)] text-sm font-medium italic">
                      No projects in this category yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="card-saas p-0 w-full max-w-[400px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)] flex justify-between items-center">
              <h3 className="text-lg font-black bg-gradient-to-r from-[#FF0080] to-[#7928CA] bg-clip-text text-transparent tracking-tight uppercase">
                Edit Project
              </h3>
              <button
                onClick={() => setEditingProject(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetch(
                  `http://localhost:5000/projects/${editingProject.id}`,
                  {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: editingProject.name,
                      type: editingProject.type,
                    }),
                  }
                )
                  .then((res) => {
                    if (!res.ok) throw new Error("Update failed");
                    return res.json();
                  })
                  .then(() => {
                    addToast("Project updated successfully", "success");
                    setEditingProject(null);
                    fetchProjects();
                  })
                  .catch((err) => {
                    console.error(err);
                    addToast("Failed to update project", "error");
                  });
              }}
              className="p-6 space-y-5"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Project Name
                </label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      name: e.target.value,
                    })
                  }
                  className="input-saas w-full h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Project Type
                </label>
                <select
                  value={editingProject.type}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      type: e.target.value,
                    })
                  }
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
