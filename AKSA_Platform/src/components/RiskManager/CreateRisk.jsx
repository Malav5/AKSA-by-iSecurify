import React, { useEffect, useState } from "react";

const CreateRisk = ({ riskData, setRiskData, onClose, onSubmit }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className={`bg-white/90 rounded-2xl shadow-2xl p-8 max-w-2xl w-full transform transition-transform duration-600 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-20"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create new risk</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-red-600"
          >
            ✕
          </button>
        </div>

        {/* Risk Name */}
        <div className="mb-6">
          <label className="block font-medium text-gray-600 mb-1">
            Risk Name
          </label>
          <textarea
            value={riskData.name}
            onChange={(e) => setRiskData({ ...riskData, name: e.target.value })}
            className="w-full border border-gray-300 rounded px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#ee8cee]/40 focus:border-[#800080]"
            placeholder="Enter risk name..."
            required
            maxLength={200}
            rows={4}
          />
        </div>

        {/* Form Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-[#800080] to-[#ee8cee] text-white px-6 py-2 rounded-lg hover:from-[#700070] hover:to-[#d17ad1] font-semibold shadow"
          >
            Create Risk
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRisk;