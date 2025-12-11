import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";

const schema = yup.object({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "At least 8 characters")
    .matches(/[A-Z]/, "Must include an uppercase letter")
    .matches(/[a-z]/, "Must include a lowercase letter")
    .matches(/\d/, "Must include a number")
    // any non-alphanumeric counts as special
    .matches(/[^A-Za-z0-9]/, "Must include a special character"),
  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

export default function SetupPassword() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { token } = useParams();

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    watch,
  } = useForm({ resolver: yupResolver(schema), mode: "onChange" });

  const pwd = watch("password") || "";
  const confirm = watch("confirmPassword") || "";

  const checks = useMemo(
    () => [
      { label: "At least 8 characters", ok: pwd.length >= 8 },
      { label: "Uppercase letter", ok: /[A-Z]/.test(pwd) },
      { label: "Lowercase letter", ok: /[a-z]/.test(pwd) },
      { label: "Number", ok: /\d/.test(pwd) },
      { label: "Special character", ok: /[^A-Za-z0-9]/.test(pwd) },
    ],
    [pwd]
  );

  const strength = useMemo(() => checks.filter((c) => c.ok).length, [checks]);

  const onSubmit = async (data) => {
    if (!token) {
      toast.error(
        "Invalid or missing token. Please use the link from your email."
      );
      return;
    }

    try {
      const payload = {
        password: data.password.trim(),
        confirmPassword: data.confirmPassword.trim(),
      };

      await axios.post(
        `${backendUrl}/api/auth/setup-password/${token}`,
        payload
      );

      toast.success("Password set successfully! You can now log in.");
      reset();
      setTimeout(() => navigate("/login"), 800);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Could not set your password. The link may be expired or invalid.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 flex items-center justify-center p-4">
      <ToastContainer position="top-center" />

      <div className="w-full max-w-md">
        <div className="bg-white/90 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-zinc-700 rounded-2xl shadow-2xl">
          <div className="px-6 sm:px-8 pt-8">
            <h1 className="text-3xl font-semibold text-center text-zinc-900 dark:text-zinc-50">
              Set Your Password
            </h1>
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-300 mt-1">
              Create a strong password to secure your account.
            </p>
          </div>

          <form
            className="px-6 sm:px-8 pb-8 pt-6 space-y-6"
            onSubmit={handleSubmit(onSubmit, (err) => {
              const firstErr = Object.values(err)[0];
              if (firstErr?.message) toast.error(firstErr.message);
            })}
            noValidate
          >
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  {...register("password")}
                  className={`w-full rounded-xl bg-white dark:bg-zinc-800 border ${
                    errors.password
                      ? "border-red-500"
                      : "border-zinc-300 dark:border-zinc-700"
                  } px-4 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter a strong password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {/* Strength bar */}
                  <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength === 0
                          ? "w-0"
                          : strength === 1
                          ? "w-1/5"
                          : strength === 2
                          ? "w-2/5"
                          : strength === 3
                          ? "w-3/5"
                          : strength === 4
                          ? "w-4/5"
                          : "w-full"
                      } ${
                        strength < 3
                          ? "bg-red-500"
                          : strength < 5
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                    />
                  </div>
                  {/* Checklist */}
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                    {checks.map((c) => (
                      <li
                        key={c.label}
                        className={`flex items-center gap-2 ${
                          c.ok ? "text-green-600" : ""
                        }`}
                      >
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full ${
                            c.ok ? "bg-green-600" : "bg-zinc-400"
                          }`}
                        />
                        {c.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  {...register("confirmPassword")}
                  className={`w-full rounded-xl bg-white dark:bg-zinc-800 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-zinc-300 dark:border-zinc-700"
                  } px-4 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600"
                  aria-label={
                    showConfirm
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              <div className="mt-2 text-sm">
                {errors.confirmPassword ? (
                  <p className="text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                ) : confirm.length > 0 ? (
                  <p
                    className={
                      confirm === pwd ? "text-green-600" : "text-amber-600"
                    }
                  >
                    {confirm === pwd
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </p>
                ) : (
                  <p className="text-zinc-500">
                    Re-enter the password to confirm.
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 shadow-lg shadow-blue-600/20 transition"
            >
              {isSubmitting ? "Setting Password..." : "Set Password"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-300 mt-4">
          Remembered your password?{" "}
          <a
            href="/login"
            className="font-medium underline underline-offset-4 hover:no-underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
