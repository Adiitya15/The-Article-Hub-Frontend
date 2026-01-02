import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

/* ----------------- Yup Validation Schema ----------------- */
const schema = yup.object({
  firstName: yup
    .string()
    .required("First name is required")
    .min(2, "Minimum 2 characters"),

  lastName: yup
    .string()
    .required("Last name is required")
    .min(2, "Minimum 2 characters"),

  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email"),

  role: yup
    .string()
    .oneOf(["user", "admin"])
    .required("Role is required"),
});

export default function EditUserStepper({
  user,
  mode = "edit", // "edit" | "create"
  onClose,
  onSave,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "user",
    },
  });

  /* -------- Prefill form -------- */
  useEffect(() => {
    if (mode === "edit" && user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      });
    }

    if (mode === "create") {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        role: "user",
      });
    }
  }, [mode, user, reset]);

  /* -------- Submit Handler -------- */
  const onSubmit = async (data) => {
    const success = await onSave(
      mode === "edit" ? user._id : null,
      data
    );

    if (success) {
      onClose(); // close modal ONLY after success
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-2">
          {mode === "edit" ? "Edit User" : "Create User"}
        </h2>

        <p className="text-xs text-gray-500 mb-4">
          <span className="text-red-500">*</span> Required fields
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* First Name */}
          <label className="block text-sm mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("firstName")}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.firstName.message}
            </p>
          )}

          {/* Last Name */}
          <label className="block text-sm mb-1 mt-3">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("lastName")}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.lastName.message}
            </p>
          )}

          {/* Email */}
          <label className="block text-sm mb-1 mt-3">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register("email")}
            className="w-full border px-3 py-2 rounded"
            disabled={mode === "edit"} // optional: lock email on edit
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {errors.email.message}
            </p>
          )}

          {/* Role */}
          <label className="block text-sm mb-1 mt-3">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            {...register("role")}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && (
            <p className="text-red-500 text-xs mt-1">
              {errors.role.message}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            >
              {mode === "edit" ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
