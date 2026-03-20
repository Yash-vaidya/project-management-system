function BookView({ project, onSelect }) {
  // ✅ Safety check
  if (!project) {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6 border">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">📙 {project.name}</h2>

        <p className="text-gray-500 text-sm mt-1">
          {project.description || "Project Index"}
        </p>
      </div>

      <h3 className="text-lg font-semibold mb-3 border-b pb-2">📑 Index</h3>

      <div className="space-y-3">
        <div
          onClick={() => onSelect("task")}
          className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
        >
          📄 Task Sheet
        </div>

        <div
          onClick={() => onSelect("mom")}
          className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
        >
          📄 MOM
        </div>

        {project.taskSheet?.startsWith("http") && (
          <div
            onClick={() => onSelect("taskLink")}
            className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
          >
            🔗 Task Link
          </div>
        )}

        {project.mom?.startsWith("http") && (
          <div
            onClick={() => onSelect("momLink")}
            className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
          >
            🔗 MOM Link
          </div>
        )}
      </div>
    </div>
  );
}

export default BookView;
