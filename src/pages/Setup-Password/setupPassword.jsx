import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const schema = yup.object({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "At least 8 characters")
    .matches(/[A-Z]/, "Must include an uppercase letter")
    .matches(/[a-z]/, "Must include a lowercase letter")
    .matches(/\d/, "Must include a number")
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
    <section className="bg-gray-50 dark:bg-gray-900">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        ></a>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Set Your Password
            </h1>
            <form
              className="space-y-4 md:space-y-6"
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
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white cursor-pointer"
                  >
                    {showPwd ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-red-500 text-xs italic mt-1">
                    {errors.password.message}
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {/* Strength bar */}
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
                      {checks.map((c) => (
                        <li
                          key={c.label}
                          className={`flex items-center gap-2 ${
                            c.ok ? "text-green-600 dark:text-green-400" : ""
                          }`}
                        >
                          <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${
                              c.ok ? "bg-green-600" : "bg-gray-400"
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
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={
                      showConfirm
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white cursor-pointer"
                  >
                    {showConfirm ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </button>
                </div>
                <div className="mt-2 text-sm">
                  {errors.confirmPassword ? (
                    <p className="text-red-500 text-xs italic">
                      {errors.confirmPassword.message}
                    </p>
                  ) : confirm.length > 0 ? (
                    <p
                      className={
                        confirm === pwd
                          ? "text-green-600 dark:text-green-400"
                          : "text-amber-600 dark:text-amber-400"
                      }
                    >
                      {confirm === pwd
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="w-full text-primary-700 bg-white border border-primary-600 hover:bg-primary-50 focus:ring-4 focus:outline-none focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-100 dark:text-primary-700 dark:hover:bg-gray-200 dark:focus:ring-primary-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Setting Password..." : "Set Password"}
              </button>

              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Remembered your password?{" "}
                <a
                  href="/login"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500 cursor-pointer"
                >
                  Sign in
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}