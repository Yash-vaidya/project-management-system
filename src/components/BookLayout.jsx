import NotesEditor from "./NotesEditor";

function BookLayout({ project, activePage, setActivePage, goBack }) {
  const handleSaveNotes = async (newNotes) => {
    await fetch(`http://localhost:5000/projects/${project.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes: newNotes }),
    });

    alert("✅ Notes Saved");
  };

  return (
    <div className="p-4">
      {/* Back */}
      <button onClick={goBack} className="mb-4 bg-gray-300 px-3 py-1 rounded">
        ← Back
      </button>

      {/* Page Buttons */}
      {!activePage && (
        <div className="flex gap-4">
          <button onClick={() => setActivePage("task")}>Task Sheet</button>
          <button onClick={() => setActivePage("mom")}>MOM</button>
          <button onClick={() => setActivePage("notes")}>Notes</button>
        </div>
      )}

      {/* ✅ Notes Page */}
      {activePage === "notes" && (
        <NotesEditor value={project.notes || ""} onSave={handleSaveNotes} />
      )}

      {/* KEEP OTHER PAGES SAFE */}
      {activePage === "task" && <div>Task Sheet Coming...</div>}
      {activePage === "mom" && <div>MOM Coming...</div>}
    </div>
  );
}

export default BookLayout;
