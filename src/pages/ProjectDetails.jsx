import { useState, useEffect } from "react";

function ProjectDetail({ project }) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (project) {
      setNotes(project.notes || "");
    }
  }, [project]);

  const handleSave = async () => {
    await fetch(`http://localhost:5000/projects/${project.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
    });

    alert("✅ Notes Saved");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Notes</h2>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full border p-2 rounded min-h-[200px]"
      />

      <button
        onClick={handleSave}
        className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
      >
        Save Notes
      </button>
    </div>
  );
}

export default ProjectDetail;
