import { useState } from "react";
import { excelToJson } from "../utils/excelToJson";
import { useToast } from "../utils/ToastContext";

function AddProject() {
  const [name, setName] = useState("");
  const [type, setType] = useState("mern");
  const { addToast } = useToast();

  const [importType, setImportType] = useState("excel");
  const [taskSheetText, setTaskSheetText] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [isLoadingSheet] = useState(false);
  const [sheetError, setSheetError] = useState("");
  const [momImportType, setMomImportType] = useState("excel");
  const [momText, setMomText] = useState("");
  const [momPreviewData, setMomPreviewData] = useState(null);
  const [momError, setMomError] = useState("");

  const [sodImportType, setSodImportType] = useState("excel");
  const [sodText, setSodText] = useState("");
  const [sodPreviewData, setSodPreviewData] = useState(null);
  const [sodError, setSodError] = useState("");

  const [notes, setNotes] = useState([]); // Array of { name: string, data: string }
  const [isReadingPdf, setIsReadingPdf] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setIsReadingPdf(true);
    
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
        addToast("Invalid file type. Please upload a PDF.", "error");
      }
    });

    setIsReadingPdf(false);
  };

  const removePdf = (index) => {
    setNotes(prev => prev.filter((_, i) => i !== index));
    addToast("Document removed", "info");
  };

  const updatePdfName = (index, newName) => {
    setNotes(prev => {
      const copy = [...prev];
      copy[index].name = newName;
      return copy;
    });
  };

  const handleExcelPaste = (e) => {
    const val = e.target.value;
    setTaskSheetText(val);
    if (!val.trim()) { setPreviewData(null); return; }
    try {
      const parsed = excelToJson(val);
      setPreviewData(parsed.length ? parsed : null);
      setSheetError("");
    } catch {
      addToast("Critical Error: Could not parse Excel data", "error");
    } finally {
      // No specific action requested for finally block in instruction, keeping it empty as per snippet.
    }
  };

  const handleGoogleChange = (e) => {
    const val = e.target.value;
    setTaskSheetText(val);
    setSheetError("");
  };

  const handleMomExcelPaste = (e) => {
    const val = e.target.value;
    setMomText(val);
    if (!val.trim()) { setMomPreviewData(null); return; }
    try {
      const parsed = excelToJson(val);
      setMomPreviewData(parsed.length ? parsed : null);
      setMomError("");
    } catch {
      setMomError("Failed to parse MOM Excel data.");
    }
  };

  const handleMomGoogleChange = (e) => {
    const val = e.target.value;
    setMomText(val);
    setMomError("");
  };

  const handleSodExcelPaste = (e) => {
    const val = e.target.value;
    setSodText(val);
    if (!val.trim()) { setSodPreviewData(null); return; }
    try {
      const parsed = excelToJson(val);
      setSodPreviewData(parsed.length ? parsed : null);
      setSodError("");
    } catch {
      setSodError("Failed to parse SOD Excel data.");
    } finally {
      // No specific action requested for finally block in instruction, keeping it empty as per snippet.
    }
  };

  const handleSodGoogleChange = (e) => {
    const val = e.target.value;
    setSodText(val);
    setSodError("");
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const isBase64 = (str) => {
    if (!str || typeof str !== 'string') return false;
    return str.startsWith("data:application/pdf;base64,") || str.includes(";base64,");
  };

  const validateUrl = (url) => {
    return url.includes("docs.google.com/spreadsheets");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // 🛑 Validation Layer
    if (!name.trim()) { setFormError("Project Name is required."); return; }
    
    if (importType === "google" && !validateUrl(taskSheetText)) { setFormError("Invalid Task Sheet Google Link."); return; }
    // if (importType === "excel" && (!previewData || previewData.length === 0)) { setFormError("Please paste valid Excel data for the Task Sheet."); return; }

    if (momText && momImportType === "google" && !validateUrl(momText)) { setFormError("Invalid MOM Google Link."); return; }
    if (sodText && sodImportType === "google" && !validateUrl(sodText)) { setFormError("Invalid SOD Google Link."); return; }

    setIsSubmitting(true);

    const taskSheetData = importType === "excel" ? JSON.stringify(previewData || []) : taskSheetText;
    const momData = momImportType === "excel" ? JSON.stringify(momPreviewData || []) : momText;
    const sodData = sodImportType === "excel" ? JSON.stringify(sodPreviewData || []) : sodText;

    const newProject = {
      name,
      type,
      taskSheet: taskSheetData,
      mom: momData,
      sod: sodData,
      notes,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch("http://localhost:5000/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      if (!res.ok) throw new Error("Failed to save");

      addToast("Project successfully archived", "success");

      // Reset Form
      setName("");
      setType("mern");
      setTaskSheetText("");
      setPreviewData(null);
      setMomText("");
      setMomPreviewData(null);
      setSodText("");
      setSodPreviewData(null);
      setNotes([]);
    } catch (err) {
      console.error(err);
      setFormError("System Error: Could not reach the database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full py-20 px-6 flex flex-col items-center justify-start dark:text-white text-[var(--text-color)] overflow-y-auto">
      <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-5 duration-700">
        <h1 className="text-4xl font-black mb-8 uppercase tracking-tighter drop-shadow-sm text-center">Commit Data Point</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--nav-bg)] border border-black/10 p-10 rounded-[40px] shadow-2xl">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-2">Internal Project Label</label>
          <input
            type="text"
            placeholder="e.g. Nexus Core"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-black/10 bg-white/50 backdrop-blur-sm text-black placeholder-black/30 p-4 w-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:bg-white transition-all font-bold"
            required
          />
        </div>

        {/* Type Dropdown */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-2">Framework Stack</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border border-black/10 bg-white/50 backdrop-blur-sm text-black p-4 w-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:bg-white transition-all font-bold appearance-none cursor-pointer"
          >
            <option value="mern">MERN</option>
            <option value="dotnet">.NET</option>
            <option value="website">Website</option>
          </select>
        </div>

        {/* Task Sheet Options */}
        <div className="space-y-4">
          <label className="text-white font-semibold">Task Sheet Source</label>
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => { setImportType('excel'); setTaskSheetText(''); setPreviewData(null); setSheetError(''); }}
              className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all ${importType === 'excel' ? 'bg-[var(--accent-color)] text-white shadow-xl scale-105' : 'bg-black/5 text-black/40 hover:bg-black/10'}`}
            >
              Excel Table
            </button>
            <button 
              type="button" 
              onClick={() => { setImportType('google'); setTaskSheetText(''); setPreviewData(null); setSheetError(''); }}
              className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all ${importType === 'google' ? 'bg-[var(--accent-color)] text-white shadow-xl scale-105' : 'bg-black/5 text-black/40 hover:bg-black/10'}`}
            >
              Live Link
            </button>
          </div>

          {importType === "excel" ? (
             <textarea
               placeholder="Paste cells directly from Excel..."
               value={taskSheetText}
               onChange={handleExcelPaste}
               className="border border-black/10 bg-white/50 text-black placeholder-black/30 p-4 w-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:bg-white transition-all font-bold"
               rows={4}
             />
          ) : (
             <input
               type="text"
               placeholder="Paste public Google Sheet link here..."
               value={taskSheetText}
               onChange={handleGoogleChange}
               className="border border-black/10 bg-white/50 text-black placeholder-black/30 p-4 w-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20 focus:bg-white transition-all font-bold"
             />
          )}

          {isLoadingSheet && <p className="text-indigo-200 animate-pulse text-sm">Loading sheet data...</p>}
          {sheetError && <p className="text-red-400 text-sm">{sheetError}</p>}

          {/* Table Preview */}
          {importType === "excel" && previewData && previewData.length > 0 && (
            <div className="mt-4 border border-white/20 rounded-lg overflow-hidden bg-white/5">
              <div className="bg-white/10 p-2 border-b border-white/20 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-indigo-100">Live Table Preview (Showing up to 5 rows)</h3>
                <span className="text-xs text-indigo-200 bg-white/10 px-2 py-1 rounded">Total Rows: {previewData.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-indigo-100">
                  <thead className="text-xs uppercase bg-white/10 text-indigo-50">
                    <tr>
                      {Object.keys(previewData[0]).map((key, i) => (
                        <th key={i} className="px-4 py-2 border-r border-white/10 whitespace-nowrap">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-white/10 hover:bg-white/10 transition">
                        {Object.values(row).map((val, idx) => (
                          <td key={idx} className="px-4 py-2 border-r border-white/10 max-w-[200px] truncate" title={val}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {importType === "google" && taskSheetText.includes("docs.google.com/spreadsheets") && (
            <div className="mt-4 border border-white/20 rounded-lg overflow-hidden bg-white/5 h-[300px]">
              <iframe 
                src={taskSheetText.includes('/edit') ? taskSheetText.replace(/\/edit.*$/, '/preview') : taskSheetText} 
                className="w-full h-full border-none bg-white" 
                title="Google Sheet Preview"
              />
            </div>
          )}
        </div>

        {/* MOM Options */}
        <div className="space-y-4">
          <label className="text-white font-semibold">MOM Source</label>
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => { setMomImportType('excel'); setMomText(''); setMomPreviewData(null); setMomError(''); }}
              className={`px-4 py-2 rounded-lg font-semibold transition ${momImportType === 'excel' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/10 text-indigo-200 hover:bg-white/20'}`}
            >
              Paste Excel Data
            </button>
            <button 
              type="button" 
              onClick={() => { setMomImportType('google'); setMomText(''); setMomPreviewData(null); setMomError(''); }}
              className={`px-4 py-2 rounded-lg font-semibold transition ${momImportType === 'google' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/10 text-indigo-200 hover:bg-white/20'}`}
            >
              Google Sheet Link
            </button>
          </div>

          {momImportType === "excel" ? (
             <textarea
               placeholder="Paste MOM directly from Excel..."
               value={momText}
               onChange={handleMomExcelPaste}
               className="border border-white/20 bg-white/10 text-white placeholder-indigo-200 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-indigo-900 transition"
               rows={4}
             />
          ) : (
             <input
               type="text"
               placeholder="Paste public Google Sheet link here for MOM..."
               value={momText}
               onChange={handleMomGoogleChange}
               className="border border-white/20 bg-white/10 text-white placeholder-indigo-200 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-indigo-900 transition"
             />
          )}

          {momError && <p className="text-red-400 text-sm">{momError}</p>}

          {/* Table Preview */}
          {momImportType === "excel" && momPreviewData && momPreviewData.length > 0 && (
            <div className="mt-4 border border-white/20 rounded-lg overflow-hidden bg-white/5">
              <div className="bg-white/10 p-2 border-b border-white/20 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-indigo-100">Live Table Preview (Showing up to 5 rows)</h3>
                <span className="text-xs text-indigo-200 bg-white/10 px-2 py-1 rounded">Total Rows: {momPreviewData.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-indigo-100">
                  <thead className="text-xs uppercase bg-white/10 text-indigo-50">
                    <tr>
                      {Object.keys(momPreviewData[0]).map((key, i) => (
                        <th key={i} className="px-4 py-2 border-r border-white/10 whitespace-nowrap">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {momPreviewData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-white/10 hover:bg-white/10 transition">
                        {Object.values(row).map((val, idx) => (
                          <td key={idx} className="px-4 py-2 border-r border-white/10 max-w-[200px] truncate" title={val}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {momImportType === "google" && momText.includes("docs.google.com/spreadsheets") && (
            <div className="mt-4 border border-white/20 rounded-lg overflow-hidden bg-white/5 h-[300px]">
              <iframe 
                src={momText.includes('/edit') ? momText.replace(/\/edit.*$/, '/preview') : momText} 
                className="w-full h-full border-none bg-white" 
                title="MOM Google Sheet Preview"
              />
            </div>
          )}
        </div>

        {/* SOD Options */}
        <div className="space-y-4">
          <label className="text-white font-semibold">SOD (Schedule of Day) Source</label>
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => { setSodImportType('excel'); setSodText(''); setSodPreviewData(null); setSodError(''); }}
              className={`px-4 py-2 rounded-lg font-semibold transition ${sodImportType === 'excel' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/10 text-indigo-200 hover:bg-white/20'}`}
            >
              Paste Excel Data
            </button>
            <button 
              type="button" 
              onClick={() => { setSodImportType('google'); setSodText(''); setSodPreviewData(null); setSodError(''); }}
              className={`px-4 py-2 rounded-lg font-semibold transition ${sodImportType === 'google' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/10 text-indigo-200 hover:bg-white/20'}`}
            >
              Google Sheet Link
            </button>
          </div>

          {sodImportType === "excel" ? (
             <textarea
               placeholder="Paste SOD directly from Excel..."
               value={sodText}
               onChange={handleSodExcelPaste}
               className="border border-white/20 bg-white/10 text-white placeholder-indigo-200 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-indigo-900 transition"
               rows={4}
             />
          ) : (
             <input
               type="text"
               placeholder="Paste public Google Sheet link here for SOD..."
               value={sodText}
               onChange={handleSodGoogleChange}
               className="border border-white/20 bg-white/10 text-white placeholder-indigo-200 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-indigo-900 transition"
             />
          )}

          {sodError && <p className="text-red-400 text-sm">{sodError}</p>}

          {/* Table Preview */}
          {sodImportType === "excel" && sodPreviewData && sodPreviewData.length > 0 && (
            <div className="mt-4 border border-white/20 rounded-lg overflow-hidden bg-white/5">
              <div className="bg-white/10 p-2 border-b border-white/20 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-indigo-100">Live Table Preview (Showing up to 5 rows)</h3>
                <span className="text-xs text-indigo-200 bg-white/10 px-2 py-1 rounded">Total Rows: {sodPreviewData.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-indigo-100">
                  <thead className="text-xs uppercase bg-white/10 text-indigo-50">
                    <tr>
                      {Object.keys(sodPreviewData[0]).map((key, i) => (
                        <th key={i} className="px-4 py-2 border-r border-white/10 whitespace-nowrap">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sodPreviewData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-white/10 hover:bg-white/10 transition">
                        {Object.values(row).map((val, idx) => (
                          <td key={idx} className="px-4 py-2 border-r border-white/10 max-w-[200px] truncate" title={val}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {sodImportType === "google" && sodText.includes("docs.google.com/spreadsheets") && (
            <div className="mt-4 border border-white/20 rounded-lg overflow-hidden bg-white/5 h-[300px]">
              <iframe 
                src={sodText.includes('/edit') ? sodText.replace(/\/edit.*$/, '/preview') : sodText} 
                className="w-full h-full border-none bg-white" 
                title="SOD Google Sheet Preview"
              />
            </div>
          )}
        </div>



        {/* Notes / PDF Upload */}
        <div className="space-y-6">
          <div className="flex items-center justify-between ml-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Resource Library (Multi-PDF Support)</label>
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">{notes.length} Docs Attached</span>
          </div>
          
          <div className="flex flex-col gap-6">
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            
            <label 
              htmlFor="pdf-upload"
              className={`border-2 border-dashed border-black/10 hover:border-[var(--accent-color)]/40 bg-white/40 backdrop-blur-sm p-12 rounded-[40px] transition-all cursor-pointer flex flex-col items-center justify-center gap-4 text-center group active:scale-[0.98] ${notes.length > 0 ? 'border-green-500/20 bg-green-500/5' : ''}`}
            >
              <div className="text-6xl text-black/10 group-hover:scale-110 group-hover:text-[var(--accent-color)]/20 transition-all">📥</div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-black/40">Inject PDF Documents</p>
                <p className="text-[10px] text-black/20 font-bold uppercase mt-2">Multiple files supported • Auto-encoding enabled</p>
              </div>
            </label>

            {/* List of Documents */}
            {notes.length > 0 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                {notes.map((doc, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-white/70 backdrop-blur-md p-5 rounded-[25px] border border-black/5 shadow-sm group">
                    <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📄</div>
                    <div className="flex-1 space-y-1">
                      <input 
                        type="text"
                        value={doc.name}
                        onChange={(e) => updatePdfName(idx, e.target.value)}
                        className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs font-black uppercase tracking-widest text-black w-full"
                        placeholder="Document Name"
                      />
                      <p className="text-[9px] font-bold text-black/30 uppercase">Vector Encoding: {Math.round(doc.data.length / 1024)} KB</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removePdf(idx)}
                      className="w-10 h-10 bg-black/5 hover:bg-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all group-hover:opacity-100 opacity-30"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global Form Error */}
        {formError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-[10px] font-black uppercase tracking-widest py-4 px-6 rounded-2xl text-center">
            ⚠️ System Warning: {formError}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white px-6 py-6 rounded-[30px] font-black text-sm tracking-[0.3em] uppercase shadow-2xl transition-all active:scale-95 w-full mt-6 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50 cursor-wait animate-pulse' : 'hover:scale-105'}`}
        >
          {isSubmitting ? "Archiving Docs..." : "💾 Commit System Data"}
        </button>
      </form>
      </div>
    </div>
  );
}

export default AddProject;
