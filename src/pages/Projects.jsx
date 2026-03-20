import { useEffect, useState } from "react";
import ProjectList from "../components/ProjectList";
import ModuleCards from "../components/ModuleCards";
import BookLayout from "../components/BookLayout";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activePage, setActivePage] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  // ✅ filter by type
  const filteredProjects = projects.filter(
    (proj) => proj.type === selectedModule,
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>

      {!selectedModule && <ModuleCards onSelect={setSelectedModule} />}

      {selectedModule && !selectedProject && (
        <ProjectList
          projects={filteredProjects}
          onSelect={(proj) => {
            setSelectedProject(proj);
            setActivePage(null);
          }}
        />
      )}

      {selectedModule && selectedProject && (
        <BookLayout
          project={selectedProject}
          module={selectedModule}
          activePage={activePage}
          setActivePage={setActivePage}
          goBack={() => {
            if (activePage) setActivePage(null);
            else if (selectedProject) setSelectedProject(null);
            else setSelectedModule(null);
          }}
        />
      )}
    </div>
  );
}

export default Projects;
