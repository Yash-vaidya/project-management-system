function IndexSidebar({ setActivePage }) {
  return (
    <div className="w-60 bg-white shadow rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-4">📙 Index</h3>

      <div
        onClick={() => setActivePage("taskSheet")}
        className="cursor-pointer p-2 rounded hover:bg-gray-100"
      >
        📄 Task Sheet
      </div>

      <div
        onClick={() => setActivePage("mom")}
        className="cursor-pointer p-2 rounded hover:bg-gray-100"
      >
        📄 MOM
      </div>

      <div
        onClick={() => setActivePage("notes")}
        className="cursor-pointer p-2 rounded hover:bg-gray-100"
      >
        📝 Notes
      </div>
    </div>
  );
}

export default IndexSidebar;
