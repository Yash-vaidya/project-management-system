import { useEffect, useState } from "react";
import ProjectBook from "../components/ProjectBook";
import BookLayout from "../components/BookLayout";
import { useToast } from "../utils/ToastContext";

function Projects({ toggleSidebar, isSidebarCollapsed }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [pageMap, setPageMap] = useState({ mern: 0, dotnet: 0, website: 0 });
  const { addToast } = useToast();

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetch("http://localhost:5000/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  const handlePageChange = (catId, direction) => {
    setPageMap(prev => ({
      ...prev,
      [catId]: prev[catId] + direction
    }));
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project? Data will be lost permanently.")) return;
    try {
      await fetch(`http://localhost:5000/projects/${id}`, { method: "DELETE" });
      setProjects(projects.filter(p => p.id !== id));
      if (selectedProject && selectedProject.id === id) {
        setSelectedProject(null);
        setActivePage(null);
      }
      addToast("Project deleted", "info");
    } catch (err) {
      console.error(err);
      addToast("Failed to delete project", "error");
    }
  };

  const categories = [
    { id: "mern", name: "MERN Stack", icon: "⚛️" },
    { id: "dotnet", name: ".NET Development", icon: "🪟" },
    { id: "website", name: "Websites", icon: "🌐" }
  ];

  return (
    <div className="p-10 min-h-screen transition-colors duration-300">
      <div className="mb-12">
        <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase drop-shadow-lg dark:text-white text-[var(--text-color)]">Resource Library</h1>
        <p className="dark:text-indigo-300/40 text-black/40 text-[10px] font-bold uppercase tracking-[0.4em] ml-1">Archive {projects.length} Total Projects</p>
      </div>

      {!selectedProject ? (
        <div className="flex flex-col gap-20 max-w-7xl">
          {categories.map((cat) => {
            const catProjects = projects.filter(p => p.type === cat.id);
            const totalPages = Math.ceil(catProjects.length / ITEMS_PER_PAGE);
            const currentPage = pageMap[cat.id];
            const paginatedProjects = catProjects.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

            return (
              <div key={cat.id} className="relative group animate-in fade-in slide-in-from-bottom-5 duration-700">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-8 ml-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500">{cat.icon}</span>
                    <div>
                      <h2 className="text-xl font-black dark:text-white/80 text-black/80 tracking-widest uppercase group-hover:dark:text-white group-hover:text-[var(--accent-color)] transition-colors">
                        {cat.name}
                      </h2>
                      <p className="text-[9px] font-bold dark:text-indigo-400/40 text-black/30 uppercase tracking-widest mt-1">{catProjects.length} Records found</p>
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  {catProjects.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center gap-2 mr-8">
                      <button 
                         disabled={currentPage === 0}
                         onClick={(e) => { e.stopPropagation(); handlePageChange(cat.id, -1); }}
                         className={`p-2 rounded-xl border dark:border-white/10 border-black/10 transition-all ${currentPage === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[var(--accent-color)] hover:border-[var(--accent-hover)] shadow-lg'}`}
                      >
                         <span className={currentPage === 0 ? "" : "text-white"}>◀</span>
                      </button>
                      <span className="text-[10px] font-black tracking-widest dark:text-indigo-300 text-[var(--text-color)] w-12 text-center uppercase">
                        {currentPage + 1} / {totalPages}
                      </span>
                      <button 
                         disabled={currentPage >= totalPages - 1}
                         onClick={(e) => { e.stopPropagation(); handlePageChange(cat.id, 1); }}
                         className={`p-2 rounded-xl border dark:border-white/10 border-black/10 transition-all ${currentPage >= totalPages - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[var(--accent-color)] hover:border-[var(--accent-hover)] shadow-lg'}`}
                      >
                         <span className={currentPage >= totalPages - 1 ? "" : "text-white"}>▶</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* The Shelf Container */}
                <div className="relative pt-6 pb-2">
                  {/* The Books */}
                  <div className="flex flex-wrap items-end gap-3 md:gap-5 px-10 min-h-[14rem] md:min-h-[16rem]">
                    {paginatedProjects.length > 0 ? (
                      paginatedProjects.map((proj) => (
                        <ProjectBook 
                          key={proj.id} 
                          project={proj} 
                          onSelect={(p) => {
                            setSelectedProject(p);
                            setActivePage(null);
                          }}
                          onDelete={handleDeleteProject}
                        />
                      ))
                    ) : (
                      <div className="w-full text-center py-10 dark:text-white/10 text-slate-300 italic font-bold tracking-widest uppercase text-xs font-black">Shelf currently empty</div>
                    )}
                  </div>

                  {/* The Physical Shelf (Polished) */}
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-white/5 backdrop-blur-3xl border-t border-white/10 rounded-t-sm shadow-[0_15px_40px_rgba(0,0,0,0.6)]"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-10 skew-x-[45deg] bg-white/[0.02] border-b border-white/[0.05] -z-10 transform origin-bottom border-x border-white/10"></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <BookLayout
          project={selectedProject}
          activePage={activePage}
          setActivePage={setActivePage}
          goBack={() => {
            if (activePage) setActivePage(null);
            else setSelectedProject(null);
          }}
          onDelete={() => handleDeleteProject(selectedProject.id)}
          toggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
      )}
    </div>
  );
}

export default Projects;
