import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import { updateTaskById } from "../../services/TaskServics";

const TaskDetail = ({ task, onClose }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...task });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateTaskById(task._id, formData);
      alert("✅ Task updated successfully!");
      setEditMode(false);
      onClose(); // Optionally refresh parent list
    } catch (error) {
      console.error(error);
      alert("❌ Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label, field, editable = true) => (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{label}</h4>
      {editMode && editable ? (
        <input
          className="w-full border px-3 py-1.5 rounded"
          value={formData[field] || ""}
          onChange={(e) => handleChange(field, e.target.value)}
        />
      ) : (
        <p className="text-gray-900">{task[field] || "—"}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white/90 rounded-2xl shadow-2xl p-8 max-w-3xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Task Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {renderField("Task Name", "name")}
          {renderField("Criticality", "criticality")}
          {renderField("Priority", "priority")}
          {renderField("Status", "status")}
          {renderField("Assignee", "assignee")}
          {renderField("Category", "category")}
          {renderField("Description", "description")}
          {renderField("Notes", "notes")}
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Created On</h4>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="text-gray-900">
                {new Date(task.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Updated On</h4>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="text-gray-900">
                {new Date(task.updatedAt || task.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            Close
          </button>
          {editMode ? (
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 font-semibold"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-5 py-2 text-white bg-gradient-to-r from-[#800080] to-[#ee8cee] rounded-lg hover:from-[#700070] hover:to-[#d17ad1] font-semibold shadow"
            >
              Edit Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
