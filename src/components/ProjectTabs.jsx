function ProjectTabs({ activeSection, setActiveSection }) {
  return (
    <div className="flex gap-4 mb-4">
      <button
        className={`px-4 py-2 rounded ${
          activeSection === "task" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
        onClick={() => setActiveSection("task")}
      >
        Task Sheet
      </button>

      <button
        className={`px-4 py-2 rounded ${
          activeSection === "mom" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
        onClick={() => setActiveSection("mom")}
      >
        MOM
      </button>
    </div>
  );
}

export default ProjectTabs;
