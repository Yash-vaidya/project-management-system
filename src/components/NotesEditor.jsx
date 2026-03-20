import { useState, useEffect } from "react";

function NotesEditor({ value = "", onSave }) {
  const [content, setContent] = useState(value);

  useEffect(() => {
    setContent(value);
  }, [value]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">📝 Notes</h2>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border p-2 rounded min-h-[200px]"
      />

      <button
        onClick={() => onSave(content)}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
      >
        💾 Save
      </button>
    </div>
  );
}

export default NotesEditor;
