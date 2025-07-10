import React, { useEffect, useState } from "react";

const CreateRisk = ({ riskData, setRiskData, onClose, onSubmit }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className={`bg-white rounded-lg shadow-lg p-8 max-w-xl w-full h-[350px] flex flex-col
  transform transition-transform duration-600 ease-out
  ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-20"}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Risk</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl font-bold text-gray-500 hover:text-red-600"
          >
            ✕
          </button>
        </div>

        <label className="block font-medium text-gray-600 mb-1">Risk Name</label>
        <textarea
          value={riskData.name}
          onChange={(e) => setRiskData({ ...riskData, name: e.target.value })}
          className="w-full border border-gray-300 rounded px-4 py-2 flex-grow resize-none"
          placeholder="Enter risk name"
          required
          maxLength={200}
          style={{ minHeight: 0 }}
        />

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded "
          >
            Create Risk
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRisk;
