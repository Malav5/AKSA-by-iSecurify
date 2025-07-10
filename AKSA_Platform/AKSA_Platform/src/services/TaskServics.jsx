// services/TaskServices.js

const BASE_URL = "http://localhost:3000/api";

export const fetchAllTasks = async () => {
  const res = await fetch(`${BASE_URL}/get-all-tasks`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return await res.json();
};

export const deleteTaskById = async (taskId) => {
  const res = await fetch(`${BASE_URL}/delete-task/${taskId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return await res.json();
};

export const updateTaskById = async (taskId, updatedData) => {
  const res = await fetch(`${BASE_URL}/update-task/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return await res.json();
};

export const createTask = async (taskData) => {
  const res = await fetch(`${BASE_URL}/create-task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return await res.json();
};
