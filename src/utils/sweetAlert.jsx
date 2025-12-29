import Swal from "sweetalert2";

/**
 * Confirm delete dialog
 */
export const confirmDelete = async ({
  title = "Delete this item?",
  text = "This action cannot be undone.",
  confirmText = "Yes, delete it",
}) => {
  return await Swal.fire({
    title,
    text,
    background: "#0f172a",
    color: "#e5e7eb",
    width: "25rem",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#374151",
    focusCancel: true,
    customClass: {
      popup: "rounded-xl shadow-lg border border-gray-700",
      title: "text-lg font-semibold text-gray-100",
      htmlContainer: "text-sm text-gray-300",
      confirmButton: "px-4 py-2 rounded-md text-sm font-medium",
      cancelButton: "px-4 py-2 rounded-md text-sm font-medium",
    },
  });
};

/**
 * Success alert
 */
export const showSuccess = async ({
  title = "Success",
  text = "",
}) => {
  return await Swal.fire({
    title,
    text,
    timer: 1300,
    showConfirmButton: false,
    background: "#0f172a",
    color: "#e5e7eb",
    width: "22rem",
    customClass: {
      popup: "rounded-xl shadow-lg border border-gray-700",
      title: "text-base font-medium text-gray-100",
      htmlContainer: "text-sm text-gray-300",
    },
  });
};

/**
 * Error alert
 */
export const showError = async ({
  title = "Failed",
  text = "Something went wrong. Please try again.",
}) => {
  return await Swal.fire({
    title,
    text,
    background: "#0f172a",
    color: "#e5e7eb",
    width: "22rem",
    confirmButtonColor: "#374151",
    customClass: {
      popup: "rounded-xl shadow-lg border border-gray-700",
      title: "text-base font-medium text-gray-100",
      htmlContainer: "text-sm text-gray-300",
      confirmButton: "px-4 py-2 rounded-md text-sm font-medium",
    },
  });
};
