import { useState } from "react";
import { excelToJson } from "../utils/excelToJson";

function ExcelPasteInput({ onConvert }) {
  const [text, setText] = useState("");

  const handleConvert = () => {
    const data = excelToJson(text);
    onConvert(data);
  };

  return (
    <div className="mb-4">
      <textarea
        placeholder="Paste Excel data here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border p-2 rounded mb-2"
        rows={5}
      />

      <button
        onClick={handleConvert}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Convert to Table
      </button>
    </div>
  );
}

export default ExcelPasteInput;
