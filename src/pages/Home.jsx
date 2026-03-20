function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Home</h1>

      <p className="mb-6 text-gray-700 text-lg">What's in your mind today?</p>

      {/* Placeholder for chart */}
      <div className="flex space-x-4">
        <div className="w-1/2 h-48 bg-gray-200 flex items-center justify-center">
          Pie Chart Placeholder
        </div>
        <div className="w-1/2 h-48 bg-gray-200 flex items-center justify-center">
          Line Chart Placeholder
        </div>
      </div>
    </div>
  );
}

export default Home;
