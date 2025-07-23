import React from "react";
export const ComplianceScore = () => {
  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6 w-full max-w-xl mx-auto">
      <h2 className="text-gray-800 font-semibold text-lg mb-6 text-center sm:text-left">
        Compliance Score
      </h2>

      {/* Responsive Half-Round Gauge */}
      <div className="relative w-full flex justify-center items-center">
        <div className="w-[250px] sm:w-[300px] md:w-[350px] lg:w-[400px] h-[120px] sm:h-[150px] md:h-[175px] lg:h-[200px] bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-t-full relative flex items-center justify-center">
          {/* Score display */}
        </div>
      </div>

      {/* Labels under arc */}
      <div className="flex justify-between px-6 sm:px-12 mt-4 text-gray-700 font-medium text-xs sm:text-sm">
        <span>D</span>
        <span>C</span>
        <span>B</span>
        <span>A</span>
      </div>

      {/* Awaiting score */}
      <div className="text-gray-500 mt-4 text-center font-medium text-sm sm:text-base">
        Awaiting score...
      </div>
    </div>
  );
};
