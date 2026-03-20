function ProjectList({ projects, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {projects.map((proj) => (
        <div
          key={proj.id}
          onClick={() => onSelect(proj)}
          className="bg-white shadow-md rounded-xl p-6 cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold">{proj.name}</h2>
        </div>
      ))}
    </div>
  );
}

export default ProjectList;
