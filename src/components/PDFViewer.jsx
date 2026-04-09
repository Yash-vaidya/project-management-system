import React, { useState, useEffect } from "react";

function PDFViewer({ data, title = "System Documentation", onUpload }) {
  const [files, setFiles] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Synchronize internal files with the 'data' prop
  useEffect(() => {
    if (!data) {
      setFiles([]);
      return;
    }

    try {
      let rawFiles = [];
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            rawFiles = parsed;
          } else {
            rawFiles = [{ name: "Document.pdf", data: data }];
          }
        } catch {
          if (data.startsWith("data:application/pdf") || data.length > 100) {
            rawFiles = [{ name: "Document.pdf", data: data }];
          } else {
            setFiles([]);
            return;
          }
        }
      } else if (Array.isArray(data)) {
        rawFiles = data;
      } else {
        rawFiles = [{ name: "Document.pdf", data: data }];
      }
      
      const restoredFiles = rawFiles.map((item) => {
        if (!item || !item.data) return null;
        let base64Str = item.data;
        if (typeof item.data === 'string' && item.data.includes(",")) {
          base64Str = item.data.split(",")[1];
        }
        try {
          const byteCharacters = atob(base64Str);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "application/pdf" });
          return { name: item.name, url: URL.createObjectURL(blob) };
        } catch (e) {
          console.error("Failed to decode PDF vector:", e);
          return null;
        }
      }).filter(Boolean);

      setFiles(restoredFiles);
      
      // Cleanup URLs on unmount
      return () => {
        restoredFiles.forEach(f => URL.revokeObjectURL(f.url));
      };
    } catch (e) {
      console.error("PDF Parsing Error:", e);
    }
  }, [data]);

  const handleFileSelect = async (e) => {
    const selected = Array.from(e.target.files).filter(f => f.type === "application/pdf");
    if (selected.length === 0) return;

    const newFilesData = await Promise.all(
      selected.map((file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(",")[1];
            resolve({ name: file.name, data: base64 });
          };
          reader.readAsDataURL(file);
        })
      )
    );

    if (onUpload) {
      // Consolidate with existing data if possible, or just send new
      const currentData = Array.isArray(data) ? data : (data ? [{ name: "Document.pdf", data }] : []);
      onUpload([...currentData, ...newFilesData]);
    }
  };

  return (
    <div className="flex flex-col h-full w-full animate-fadeIn">
      {/* Viewer Header */}
      <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">{title}</h3>
          {files.length > 0 && (
            <span className="px-2 py-0.5 bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-[10px] font-bold rounded">
              {files.length} DOCS
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            id="pdf-upload-viewer"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <label 
            htmlFor="pdf-upload-viewer"
            className="p-1.5 px-3 bg-[var(--bg-color)] hover:bg-[var(--border-color)] rounded text-[10px] font-bold uppercase transition-all cursor-pointer"
          >
            ➕ Add PDF
          </label>
        </div>
      </div>

      {/* Tab bar for multi-PDF */}
      {files.length > 1 && (
        <div className="flex items-center gap-2 p-2 bg-[var(--bg-color)]/10 overflow-x-auto border-b border-[var(--border-color)] scrollbar-hide">
          {files.map((file, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase whitespace-nowrap transition-all ${
                activeIndex === idx 
                  ? "bg-[var(--primary-color)] text-white shadow-sm" 
                  : "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-color)]"
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>
      )}

      {/* Frame Container */}
      <div className="flex-1 overflow-hidden relative bg-[var(--bg-color)]">
        {files.length > 0 ? (
          <iframe
            src={files[activeIndex]?.url}
            title="System Documentation Viewer"
            className="w-full h-full border-none"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-10 text-center">
            <div className="w-16 h-16 bg-[var(--primary-color)]/10 rounded-full flex items-center justify-center text-3xl mb-4 opacity-50">📂</div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">No Documentation Loaded</h4>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium max-w-[200px]">
              Upload project PDF documents to synchronize with this node.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PDFViewer;