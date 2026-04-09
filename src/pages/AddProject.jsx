import { useState } from "react";
import { excelToJson } from "../utils/excelToJson";
import { useToast } from "../utils/ToastContext";
import { useNavigate } from "react-router-dom";

/**
 * AddProject Component
 * Streamlined project creation with optional data synchronization vectors.
 */
function AddProject() {
  const [name, setName] = useState("");
  const [type, setType] = useState("mern");
  const [notes, setNotes] = useState([]); // PDF documents
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Advanced Sync States
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [importType, setImportType] = useState("excel");
  const [taskSheetText, setTaskSheetText] = useState("");
  const [previewData, setPreviewData] = useState(null);

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
          addToast(`${file.name} encoded successfully`, "success");
        };
        reader.readAsDataURL(file);
      } else {
        addToast("Only PDF documents are supported for library injection.", "error");
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
      setPreviewData(parsed.length ? parsed : null);
    } catch {
      addToast("Failed to parse Excel clip.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Project Identity is required.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    const newProject = {
      name,
      type,
      taskSheet: importType === "excel" ? (previewData ? JSON.stringify(previewData) : null) : (taskSheetText || null),
      mom: null,
      sod: null,
      notes,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch("http://localhost:5000/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      if (!res.ok) throw new Error("Database rejection.");

      addToast("New Resource successfully archived", "success");
      navigate("/");
    } catch (err) {
      setFormError("System Error: Could not synchronize with database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 animate-fadeIn min-h-[calc(100vh-100px)] flex flex-col px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight uppercase">Archive New Resource</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 font-medium italic">Initialize a new project node in the central database.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-10 pb-20">
        {/* Core Parameters */}
        <div className="card-saas p-10 space-y-10">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-color)] pb-2 border-b border-[var(--border-color)]">Core Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Resource Nickname</label>
                <input
                  type="text"
                  placeholder="e.g. Project Nexus"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-saas w-full h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Technology Sector</label>
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

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-color)] pb-2 border-b border-[var(--border-color)]">Document Injection (PDF)</h3>
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
                  <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-tight">Drop Blueprints or Project PDF Docs</p>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-1">Files are encoded into the database synchronization stream</p>
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
        </div>

        {/* Optional Advanced Data */}
        <div className="px-2">
          <button 
            type="button" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-all flex items-center gap-2"
          >
            {showAdvanced ? "▼ Hide Advanced Sync Options" : "▶ Show Advanced Sync Options (Excel/Google)"}
          </button>
          
          {showAdvanced && (
            <div className="mt-6 space-y-6 animate-in slide-in-from-top-4 duration-400">
              <div className="card-saas p-8 space-y-6 border border-[var(--primary-color)]/20 bg-[var(--primary-color)]/5">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[var(--primary-color)]">Task Spreadsheet Sync</h3>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setImportType('excel')} className={`px-4 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all ${importType === 'excel' ? 'bg-[var(--primary-color)] text-white' : 'bg-[var(--bg-color)] text-[var(--text-secondary)] border border-[var(--border-color)]'}`}>Excel Paste</button>
                    <button type="button" onClick={() => setImportType('google')} className={`px-4 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all ${importType === 'google' ? 'bg-[var(--primary-color)] text-white' : 'bg-[var(--bg-color)] text-[var(--text-secondary)] border border-[var(--border-color)]'}`}>Remote Link</button>
                  </div>
                </div>
                
                {importType === "excel" ? (
                  <div className="space-y-3">
                    <textarea 
                      placeholder="Paste Excel Rows here..." 
                      value={taskSheetText} 
                      onChange={handleExcelPaste} 
                      className="input-saas w-full h-32 text-xs font-medium"
                    />
                    {previewData && (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--success)] uppercase">
                        <span>✅</span> {previewData.length} records detected in clip
                      </div>
                    )}
                  </div>
                ) : (
                  <input 
                    type="text" 
                    placeholder="Enter Google Spreadsheet Public URL..." 
                    value={taskSheetText} 
                    onChange={(e) => setTaskSheetText(e.target.value)} 
                    className="input-saas w-full h-11" 
                  />
                )}
                <p className="text-[9px] text-[var(--text-secondary)] italic uppercase tracking-tighter text-center">Note: SOD and MOM vectors can be initialized later from the node dashboard.</p>
              </div>
            </div>
          )}
        </div>

        {formError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
             <span className="text-lg">⚠️</span>
             <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Protocol Failure: {formError}</p>
          </div>
        )}

        {/* Submission Bar */}
        <div className="pt-10 border-t border-[var(--border-color)] flex flex-col md:flex-row justify-end gap-4">
           <button 
            type="button" 
            onClick={() => navigate("/")}
            className="px-10 py-4 text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] hover:bg-[var(--bg-color)] rounded-2xl transition-all border border-transparent hover:border-[var(--border-color)]"
           >
             Cancel Protocol
           </button>
           <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn-primary min-w-[300px] py-4 shadow-2xl shadow-[#556EE6]/30 disabled:opacity-50 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-4"
           >
             {isSubmitting ? (
               <>
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 <span>Syncing with Database...</span>
               </>
             ) : (
               <>
                 <span>💾</span>
                 <span>Commit Resource to Archive</span>
               </>
             )}
           </button>
        </div>
      </form>
    </div>
  );
}

export default AddProject;
