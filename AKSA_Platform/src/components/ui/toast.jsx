import { toast } from "react-toastify";

// Common styling options
const commonOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  progressClassName: "bg-white",
};

// Success Toast
export const showSuccess = (message) =>
  toast.success(message, {
    ...commonOptions,
    className: "bg-green-600 text-white font-semibold shadow-md rounded-lg",
  });

// Error Toast
export const showError = (message) =>
  toast.error(message, {
    ...commonOptions,
    className: "bg-red-600 text-white font-semibold shadow-md rounded-lg",
  });

// Info Toast
export const showInfo = (message) =>
  toast.info(message, {
    ...commonOptions,
    className: "bg-blue-600 text-white font-semibold shadow-md rounded-lg",
  });

// Warning Toast
export const showWarning = (message) =>
  toast.warning(message, {
    ...commonOptions,
    className: "bg-yellow-500 text-white font-semibold shadow-md rounded-lg",
  });
