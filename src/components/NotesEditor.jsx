import { useState, useEffect } from "react";

function NotesEditor({ value = "", onSave }) {
  const [content, setContent] = useState(value);

  useEffect(() => {
    setContent(value);
  }, [value]);

  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-xl font-black mb-4 dark:text-white text-[var(--text-color)] uppercase tracking-tighter">📝 Notes</h2>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-[400px] p-6 rounded-3xl dark:bg-white/5 bg-black/5 dark:text-white text-[var(--text-color)] border dark:border-white/10 border-black/10 focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition-all shadow-inner font-medium leading-relaxed custom-scrollbar"
        placeholder="Synchronize your thoughts here..."
      />

      <button
        onClick={() => onSave(content)}
        className="mt-6 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-green-600/20 transition-all hover:scale-105 active:scale-95"
      >
        💾 Save Synchronization
      </button>
    </div>
  );
}

export default NotesEditor;
