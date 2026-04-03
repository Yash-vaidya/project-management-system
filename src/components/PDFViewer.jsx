import React, { useState, useEffect } from "react";

function PDFViewer({ title = "Project Document" }) {
  const [files, setFiles] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pdfUrl, setPdfUrl] = useState("");

  // Load saved PDFs from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("pdfFiles") || "[]");
    if (saved.length > 0) {
      const restoredFiles = saved.map((item) => {
        const byteCharacters = atob(item.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new File([byteArray], item.name, { type: "application/pdf" });
      });
      setFiles(restoredFiles);
    }
  }, []);

  // Create preview URL
  useEffect(() => {
    if (files.length > 0) {
      const file = files[activeIndex];
      const url = URL.createObjectURL(file);
      setPdfUrl(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [files, activeIndex]);

  // Save PDFs to localStorage
  const saveToLocalStorage = async (newFiles) => {
    const fileData = await Promise.all(
      newFiles.map((file) =>
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

    const existing = JSON.parse(localStorage.getItem("pdfFiles") || "[]");
    const updated = [...existing, ...fileData];
    localStorage.setItem("pdfFiles", JSON.stringify(updated));
  };

  const handleUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files).filter(
      (file) => file.type === "application/pdf"
    );

    if (selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...selectedFiles]);
      await saveToLocalStorage(selectedFiles);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">{title}</h2>

        <div className="flex gap-2">
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleUpload}
          />

          {files.length > 1 && (
            <select
              value={activeIndex}
              onChange={(e) => setActiveIndex(Number(e.target.value))}
            >
              {files.map((file, index) => (
                <option key={index} value={index}>
                  {file.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 border rounded overflow-hidden">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            className="w-full h-[90vh]"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>No PDF uploaded</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PDFViewer;