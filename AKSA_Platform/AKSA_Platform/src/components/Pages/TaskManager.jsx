import Sidebar from "../Dashboard/Sidebar";
import TaskManagement from "../Dashboard/TaskManagement";
import TaskFiltersBar from "../TaskManager/TaskFilterBar";
import TasksTable from "../TaskManager/TasksTable";
import { useState } from "react";
import CreateTask from "../TaskManager/CreateTask";

export default function TaskManager() {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskData, setTaskData] = useState({ title: "", details: "" });

  const handleCreateTask = () => setShowCreateTask(true);

  const handleCloseTask = () => {
    setShowCreateTask(false);
    setTaskData({ title: "", details: "" });
  };

  const handleSubmitTask = () => {
    console.log("Task submitted:", taskData);
    // POST request to backend here
    handleCloseTask();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white text-gray-800">
      {/* Sidebar - Sticky */}
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Main content with scrollable area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-white p-6 pb-0">
          <a href="/dashboard" className="mb-2 text-primary">
            &lt; Go back to dashboard
          </a>
          <h1 className="text-2xl font-bold mt-2 mb-6">All your tasks</h1>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 pt-0">
          <TaskManagement hideViewAll={true}/>

          <TaskFiltersBar onCreateTask={handleCreateTask} />

          <TasksTable />
        </div>
      </div>

      {/* Task Modal */}
      {showCreateTask && (
        <CreateTask
          taskData={taskData}
          setTaskData={setTaskData}
          onClose={handleCloseTask}
          onSubmit={handleSubmitTask}
        />
      )}
    </div>
  );
}
