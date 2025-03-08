const MapLegend = () => {
  return (
    <div className="absolute bottom-5 right-5 bg-dark-bg-secondary p-3 rounded-lg shadow-lg z-10">
      <h3 className="text-sm font-semibold mb-2">Légende</h3>
      <div className="space-y-1">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#fc4c02] mr-2"></div>
          <span className="text-xs">Course</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#8B4513] mr-2"></div>
          <span className="text-xs">Trail</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#1e88e5] mr-2"></div>
          <span className="text-xs">Vélo</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-[#4CAF50] mr-2"></div>
          <span className="text-xs">Rando</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend; 