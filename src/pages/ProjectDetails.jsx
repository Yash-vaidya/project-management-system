import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BookLayout from "../components/BookLayout";
import { useToast } from "../utils/ToastContext";

function ProjectDetail({ toggleSidebar, isSidebarCollapsed }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Keep currentUser in sync across tabs
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('currentUser');
      setCurrentUser(saved ? JSON.parse(saved) : null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const { addToast } = useToast();

  useEffect(() => {
    fetch(`http://localhost:5000/projects/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Project not found");
        return res.json();
      })
      .then((data) => {
        setProject(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        addToast("Failed to load project details", "error");
        navigate("/projects");
      });
  }, [id, navigate, addToast]);

  const handleUpdateProject = (updatedProject) => {
    setProject(updatedProject);
  };

  const handleDeleteProject = async () => {
    // Only Super Admin can delete
    if (currentUser?.role !== 'Super Admin') {
      addToast('Only Super Admin can delete projects', 'error');
      return;
    }

    if (!window.confirm("Are you sure you want to delete this project? Data will be lost permanently.")) return;
    try {
      await fetch(`http://localhost:5000/projects/${project.id}`, { method: "DELETE" });
      addToast("Project deleted", "info");
      navigate("/projects");
    } catch (err) {
      console.error(err);
      addToast("Failed to delete project", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <BookLayout
      project={project}
      activePage={activePage}
      setActivePage={setActivePage}
      goBack={() => navigate("/projects")}
      onDelete={currentUser?.role === 'Super Admin' ? handleDeleteProject : undefined}
      onUpdateProject={handleUpdateProject}
      toggleSidebar={toggleSidebar}
      isSidebarCollapsed={isSidebarCollapsed}
    />
  );
}

export default ProjectDetail;
