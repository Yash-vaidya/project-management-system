import { useState } from "react";

function AddProject() {
  const [name, setName] = useState("");
  const [type, setType] = useState("mern");

  const [taskSheet, setTaskSheet] = useState("");
  const [mom, setMom] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newProject = {
      name,
      type, // ✅ important (mern / dotnet / website)
      taskSheet, // link OR table data (we upgrade later)
      mom,
      notes,
    };

    try {
      await fetch("http://localhost:5000/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProject),
      });

      alert("✅ Project Created");

      setName("");
      setType("mern");
      setTaskSheet("");
      setMom("");
      setNotes("");
    } catch (err) {
      console.log(err);
      alert("❌ Error");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add Project</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <input
          type="text"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />

        {/* Type Dropdown */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 w-full rounded"
        >
          <option value="mern">MERN</option>
          <option value="dotnet">.NET</option>
          <option value="website">Website</option>
        </select>

        {/* Task Sheet */}
        <textarea
          placeholder="Task Sheet (Excel link OR data)"
          value={taskSheet}
          onChange={(e) => setTaskSheet(e.target.value)}
          className="border p-2 w-full rounded"
        />

        {/* MOM */}
        <textarea
          placeholder="MOM (Meeting notes or link)"
          value={mom}
          onChange={(e) => setMom(e.target.value)}
          className="border p-2 w-full rounded"
        />

        {/* Notes */}
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border p-2 w-full rounded"
        />

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save Project
        </button>
      </form>
    </div>
  );
}

export default AddProject;
