import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const TopMetricsCards = ({ score }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white p-5 rounded shadow flex flex-col items-center justify-center">
        <h3 className="text-sm text-gray-500 mb-2">Overall Score</h3>
        <div className="w-24 h-24">
          <CircularProgressbar
            value={score}
            text={`${score}%`}
            styles={buildStyles({
              textColor: "#800080",
              pathColor: "#B266B2",
              trailColor: "#F3E8F3",
              textSize: "18px",
            })}
          />
        </div>
        <p className="text-sm text-green-600 mt-2">+4% from last week</p>
      </div>

      {/* ITAM Deadline Card */}
      <div className="bg-white p-5 rounded shadow">
        <h3 className="text-sm text-gray-500 text-center">
          AKSAValue for ITAM
        </h3>
        <p className="text-2xl font-semibold text-center text-gray-800 mt-2">
          12 days
        </p>
        <p className="text-sm text-center text-gray-500 mb-2">
          left til AKSAValue for ITAM
        </p>
        <p className="text-xs text-center text-gray-400 mb-2">date: 04/04/21</p>
        <div className="w-full h-2 bg-[#F3E8F3] rounded-full">
          <div
            className="h-2 rounded-full bg-[#B266B2]"
            style={{ width: "60%" }}
          />
        </div>
      </div>

      {/* TVM Deadline Card */}
      <div className="bg-white p-5 rounded shadow">
        <h3 className="text-sm text-gray-500 text-center">AKSAValue for TVM</h3>
        <p className="text-2xl font-semibold text-center text-gray-800 mt-2">
          8 days
        </p>
        <p className="text-sm text-center text-gray-500 mb-2">
          left til AKSAValue for TVM
        </p>
        <p className="text-xs text-center text-gray-400 mb-2">date: 04/04/21</p>
        <div className="w-full h-2 bg-[#F3E8F3] rounded-full">
          <div
            className="h-2 rounded-full bg-[#D1A3D1]"
            style={{ width: "40%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default TopMetricsCards;
