import { useState } from "react";
import { excelToJson } from "../utils/excelToJson";
import { useToast } from "../utils/ToastContext";
import { useNavigate } from "react-router-dom";

/**
 * AddProject Component
 * Simple project creation form
 */
function AddProject() {
  const [name, setName] = useState("");
  const [type, setType] = useState("mern");
  const [notes, setNotes] = useState([]); // PDF documents
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Excel Import States
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [taskSheetText, setTaskSheetText] = useState("");
  const [previewData, setPreviewData] = useState(null);
  
  // MOM and SOD States
  const [momText, setMomText] = useState("");
  const [momPreviewData, setMomPreviewData] = useState(null);
  const [sodText, setSodText] = useState("");
  const [sodPreviewData, setSodPreviewData] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = (re) => {
          setNotes(prev => [...prev, { 
            name: file.name.replace(/\.pdf$/i, ""), 
            data: re.target.result 
          }]);
          addToast(`${file.name} added successfully`, "success");
        };
        reader.readAsDataURL(file);
      } else {
        addToast("Only PDF files are supported.", "error");
      }
    });
  };

  const removePdf = (index) => {
    setNotes(prev => prev.filter((_, i) => i !== index));
    addToast("Document removed", "info");
  };

  const handleExcelPaste = (e) => {
    const val = e.target.value;
    setTaskSheetText(val);
    if (!val.trim()) { setPreviewData(null); return; }
    try {
      const parsed = excelToJson(val);
      if (parsed.length) {
        // Normalize status: "Done" or "Complit" -> "Completed"
        const normalized = parsed.map(row => {
          const newRow = { ...row };
          Object.keys(newRow).forEach(key => {
            if (key.toLowerCase().includes("status")) {
              const val = newRow[key];
              if (val && typeof val === "string") {
                const lower = val.toLowerCase().trim();
                if (lower === "done" || lower === "complit") {
                  newRow[key] = "Completed";
                }
              }
            }
          });
          return newRow;
        });
        setPreviewData(normalized);
      } else {
        setPreviewData(null);
      }
    } catch {
      addToast("Failed to read Excel data.", "error");
    }
  };

  const handleMomExcelPaste = (e) => {
    const val = e.target.value;
    setMomText(val);
    if (!val.trim()) { setMomPreviewData(null); return; }
    try {
      const parsed = excelToJson(val);
      if (parsed.length) {
        const normalized = parsed.map(row => {
          const newRow = { ...row };
          Object.keys(newRow).forEach(key => {
            if (key.toLowerCase().includes("status")) {
              const val = newRow[key];
              if (val && typeof val === "string") {
                const lower = val.toLowerCase().trim();
                if (lower === "done" || lower === "complit") {
                  newRow[key] = "Completed";
                }
              }
            }
          });
          return newRow;
        });
        setMomPreviewData(normalized);
      } else {
        setMomPreviewData(null);
      }
    } catch {
      addToast("Failed to read MOM Excel data.", "error");
    }
  };

  const handleSodExcelPaste = (e) => {
    const val = e.target.value;
    setSodText(val);
    if (!val.trim()) { setSodPreviewData(null); return; }
    try {
      const parsed = excelToJson(val);
      if (parsed.length) {
        const normalized = parsed.map(row => {
          const newRow = { ...row };
          Object.keys(newRow).forEach(key => {
            if (key.toLowerCase().includes("status")) {
              const val = newRow[key];
              if (val && typeof val === "string") {
                const lower = val.toLowerCase().trim();
                if (lower === "done" || lower === "complit") {
                  newRow[key] = "Completed";
                }
              }
            }
          });
          return newRow;
        });
        setSodPreviewData(normalized);
      } else {
        setSodPreviewData(null);
      }
    } catch {
      addToast("Failed to read SOD Excel data.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Please enter project name.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    const newProject = {
      name,
      type,
      taskSheet: previewData ? JSON.stringify(previewData) : (taskSheetText || null),
      mom: momPreviewData ? JSON.stringify(momPreviewData) : (momText || null),
      sod: sodPreviewData ? JSON.stringify(sodPreviewData) : (sodText || null),
      notes,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch("http://localhost:5000/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      if (!res.ok) throw new Error("Server error.");

      addToast("Project created successfully!", "success");
      navigate("/");
    } catch (err) {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 animate-fadeIn min-h-[calc(100vh-100px)] flex flex-col px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight uppercase">Add New Project</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium italic">Create a new project with all details.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-10 pb-20">
        {/* Basic Details */}
        <div className="card-saas p-10 space-y-10">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-color)] pb-2 border-b border-[var(--border-color)]">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Project"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-saas w-full h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Project Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input-saas w-full h-11 appearance-none cursor-pointer"
                >
                  <option value="mern">MERN Stack</option>
                  <option value="dotnet">.NET Development</option>
                  <option value="website">Static/Dynamic Websites</option>
                </select>
              </div>
            </div>
          </div>

          {/* PDF Upload */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-color)] pb-2 border-b border-[var(--border-color)]">Upload PDF Documents</h3>
            <div className="border-2 border-dashed border-[var(--border-color)] rounded-2xl p-10 text-center hover:border-[var(--primary-color)] transition-all bg-[var(--bg-color)]/20 cursor-pointer relative group">
              <input 
                type="file" 
                multiple 
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="space-y-3">
                <span className="text-4xl grayscale group-hover:grayscale-0 transition-all duration-500">📂</span>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-tight">Drop PDF files here</p>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-1">Click or drag to upload PDF documents</p>
                </div>
              </div>
            </div>

            {notes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                {notes.map((pdf, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-sm animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">📕</span>
                      <span className="text-[10px] font-bold truncate uppercase text-[var(--text-primary)]">{pdf.name}</span>
                    </div>
                    <button type="button" onClick={() => removePdf(idx)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-all">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Task Excel Import */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-color)] pb-2 border-b border-[var(--border-color)]">Tasks (from Excel)</h3>
            <div className="space-y-3">
              <textarea 
                placeholder="Paste your task data from Excel here..." 
                value={taskSheetText} 
                onChange={handleExcelPaste} 
                className="input-saas w-full h-32 text-xs font-medium"
              />
              {previewData && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--success)] uppercase">
                  <span>✅</span> {previewData.length} records found
                </div>
              )}
            </div>
          </div>

          {/* MOM Excel Import */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-color)] pb-2 border-b border-[var(--border-color)]">MOM (from Excel)</h3>
            <div className="space-y-2">
              <textarea 
                placeholder="Paste MOM data from Excel here..." 
                value={momText} 
                onChange={handleMomExcelPaste} 
                className="input-saas w-full h-24 text-xs font-medium"
              />
              {momPreviewData && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--success)] uppercase">
                  <span>✅</span> {momPreviewData.length} records found
                </div>
              )}
            </div>
          </div>

          {/* SOD Excel Import */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-color)] pb-2 border-b border-[var(--border-color)]">SOD (from Excel)</h3>
            <div className="space-y-2">
              <textarea 
                placeholder="Paste SOD data from Excel here..." 
                value={sodText} 
                onChange={handleSodExcelPaste} 
                className="input-saas w-full h-24 text-xs font-medium"
              />
              {sodPreviewData && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--success)] uppercase">
                  <span>✅</span> {sodPreviewData.length} records found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Google Sheets Option */}
        <div className="px-2">
          <button 
            type="button" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-all flex items-center gap-2"
          >
            {showAdvanced ? "▼ Hide Google Sheets Option" : "▶ Use Google Sheets (Optional)"}
          </button>
          
          {showAdvanced && (
            <div className="mt-6 space-y-6 animate-in slide-in-from-top-4 duration-400">
              <div className="card-saas p-8 space-y-6 border border-[var(--primary-color)]/20 bg-[var(--primary-color)]/5">
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--primary-color)]">Import from Google Sheets</h3>
                <p className="text-[9px] text-[var(--text-secondary)] italic uppercase tracking-tighter">Paste Google Sheets public URLs to import data</p>
                
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Task Sheet Google URL" 
                    value={taskSheetText} 
                    onChange={(e) => setTaskSheetText(e.target.value)} 
                    className="input-saas w-full h-11" 
                  />
                  <input 
                    type="text" 
                    placeholder="MOM Sheet Google URL" 
                    value={momText} 
                    onChange={(e) => setMomText(e.target.value)} 
                    className="input-saas w-full h-11" 
                  />
                  <input 
                    type="text" 
                    placeholder="SOD Sheet Google URL" 
                    value={sodText} 
                    onChange={(e) => setSodText(e.target.value)} 
                    className="input-saas w-full h-11" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {formError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
             <span className="text-lg">⚠️</span>
             <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Error: {formError}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="pt-10 border-t border-[var(--border-color)] flex flex-col md:flex-row justify-end gap-4">
           <button 
            type="button" 
            onClick={() => navigate("/")}
            className="px-10 py-4 text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--bg-color)] rounded-2xl transition-all border border-transparent hover:border-[var(--border-color)]"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn-primary min-w-[300px] py-4 shadow-2xl shadow-[#556EE6]/30 disabled:opacity-50 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-4"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating Project...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Create Project</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProject;
