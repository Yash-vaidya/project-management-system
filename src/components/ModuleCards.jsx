function ModuleCards({ onSelect }) {
  const modules = ["mern", "dotnet", "website"];

  return (
    <div className="grid grid-cols-3 gap-6">
      {modules.map((mod) => (
        <div
          key={mod}
          onClick={() => onSelect(mod)}
          className="bg-white shadow-md rounded-xl p-6 cursor-pointer hover:shadow-lg transition text-center"
        >
          <h2 className="text-lg font-semibold">{mod.toUpperCase()}</h2>
        </div>
      ))}
    </div>
  );
}

export default ModuleCards;
