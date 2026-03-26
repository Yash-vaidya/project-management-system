import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../utils/ToastContext";

function ProjectDetail({ project }) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    if (project && project.notes !== notes) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotes(project.notes || "");
    }
  }, [project, notes]);

  const handleSave = async () => {
    await fetch(`http://localhost:5000/projects/${project.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
    });

    addToast("Notes saved successfully", "success");
  };

  return (
    <div className="p-8 text-white">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-8 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all duration-300 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">⬅️</span>
        <span className="text-xs font-black uppercase tracking-widest">Return to Dashboard</span>
      </button>
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
