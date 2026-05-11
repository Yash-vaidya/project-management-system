import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { calculateMetrics } from "../utils/metrics";
import { useToast } from "../utils/ToastContext";

function Projects({ toggleSidebar, isSidebarCollapsed }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [pageMap, setPageMap] = useState({
    mern: 0,
    dotnet: 0,
    website: 0,
  });

  const [draggedOverShelf, setDraggedOverShelf] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  const { addToast } = useToast();

  const ITEMS_PER_PAGE = 6;

  const categories = [
    { id: "mern", name: "MERN Stack", icon: "⚛️" },
    { id: "dotnet", name: ".NET Development", icon: "🪟" },
    { id: "website", name: "Websites", icon: "🌐" },
  ];

  const fetchProjects = () => {
    fetch("http://localhost:5000/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const deleteProject = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete project "${name}"?`)) {
      try {
        await fetch(`http://localhost:5000/projects/${id}`, {
          method: "DELETE",
        });

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingProject.name,
          type: editingProject.type,
        }),
      });

      addToast("Project updated successfully", "success");

      setEditingProject(null);

      fetchProjects();
    } catch (e) {
      addToast("Failed to update project", "error");
    }
  };

  const handlePageChange = (catId, targetPage) => {
    setPageMap((prev) => ({
      ...prev,
      [catId]: targetPage,
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

    const project = projects.find(
      (p) => p.id.toString() === projectId.toString()
    );

    if (!project || project.type === catId) return;

    try {
      const updatedProject = {
        ...project,
        type: catId,
      };

      setProjects(
        projects.map((p) =>
          p.id.toString() === projectId.toString()
            ? updatedProject
            : p
        )
      );

      const response = await fetch(
        `http://localhost:5000/projects/${projectId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: catId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update project category");
      }

      addToast(
        `Project moved to ${
          categories.find((c) => c.id === catId)?.name
        }`,
        "success"
      );
    } catch (err) {
      console.error(err);

      addToast("Failed to move project", "error");
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight uppercase">
            All Projects
          </h1>

          <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium tracking-wide">
            Total: {projects.length} projects
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-12">
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
                    : Math.round(
                        (metrics.completed / metrics.total) * 100
                      ),
              };
            });

          const totalPages = Math.ceil(
            catProjects.length / ITEMS_PER_PAGE
          );

          const currentPage = pageMap[cat.id];

          const paginatedProjects = catProjects.slice(
            currentPage * ITEMS_PER_PAGE,
            (currentPage + 1) * ITEMS_PER_PAGE
          );

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
              <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {cat.icon}
                  </span>

                  <div>
                    <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">
                      {cat.name}
                    </h2>

                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-tighter mt-0.5">
                      {catProjects.length} projects
                    </p>
                  </div>
                </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {paginatedProjects.length > 0 ? (
                  paginatedProjects.map((proj) => (
                       <div
                       key={proj.id}
                       draggable
                       onClick={() =>
                         navigate(`/project/${proj.id}`)
                       }
                       onDragStart={(e) =>
                         e.dataTransfer.setData(
                           "projectId",
                           proj.id.toString()
                         )
                       }
                       className="card-saas p-3 group cursor-pointer h-[200px] flex flex-col hover:-translate-y-1 transition-transform"
                     >
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg bg-[var(--primary-color)]/10">
                          {cat.icon}
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              setEditingProject({
                                id: proj.id,
                                name: proj.name,
                                type: proj.type,
                              });
                            }}
                            className="p-1.5 bg-[var(--bg-color)] hover:bg-[var(--primary-color)] hover:text-white rounded transition-all"
                          >
                            ✏️
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              deleteProject(proj.id, proj.name);
                            }}
                            className="p-1.5 bg-[var(--bg-color)] hover:bg-red-500/10 hover:text-red-500 rounded transition-all"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 mt-3">
                        <h3 className="text-sm font-bold text-[var(--text-primary)] line-clamp-2">
                          {proj.name}
                        </h3>

                        <p className="text-[10px] text-[var(--text-secondary)] mt-2 uppercase">
                          {cat.name}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[var(--border-color)]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px]">
                            Progress
                          </span>

                          <span className="text-[10px] font-bold">
                            {proj.progress}%
                          </span>
                        </div>

                        <div className="w-full h-1.5 bg-[var(--bg-color)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--primary-color)] rounded-full"
                            style={{
                              width: `${proj.progress}%`,
                            }}
                          />
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

              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        handlePageChange(cat.id, i)
                      }
                      className={`w-8 h-8 rounded-md text-[10px] font-bold transition-all ${
                        currentPage === i
                          ? "bg-[var(--primary-color)] text-white"
                          : "bg-[var(--card-bg)] border border-[var(--border-color)]"
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

      {editingProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="card-saas w-full max-w-[400px] overflow-hidden">
            <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
              <h3 className="text-lg font-bold">
                Edit Project
              </h3>

              <button
                onClick={() => setEditingProject(null)}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={updateProject}
              className="p-6 space-y-5"
            >
              <div>
                <label className="text-[10px] font-bold uppercase">
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

              <div>
                <label className="text-[10px] font-bold uppercase">
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
                  className="input-saas w-full h-11"
                >
                  <option value="mern">MERN Stack</option>
                  <option value="dotnet">
                    .NET Development
                  </option>
                  <option value="website">
                    Websites
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setEditingProject(null)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                >
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