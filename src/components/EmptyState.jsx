function EmptyState({ type, onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <p className="text-lg">No data available</p>

      {type && (
        <button
          onClick={onCreate}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          ➕ Create {type}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
