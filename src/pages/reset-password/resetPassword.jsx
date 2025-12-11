import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
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
    // any non-alphanumeric counts as special
    .matches(/[^A-Za-z0-9]/, "Must include a special character"),
  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

const ResetPassword = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { token } = useParams();
  const [showPwd, setShowPwd] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error(
        "Invalid or missing token. Please use the link from your email."
      );
      return;
    }
    try {
      const res = await axios.post(
        `${backendUrl}/api/auth/reset-password/${token}`,
        {
          password: data.password,
          confirmPassword: data.confirmPassword,
        }
      );
      toast.success("Password reset successfully");
      setTimeout(() => navigate("/login"), 500);
    } catch (err) {
      toast.error("Failed to reset password");
      console.error(
        "Reset Password Error:",
        err || err.response?.data?.message
      );
    }
  };

//   return (
//     <section className="bg-gray-50 dark:bg-gray-900">
//       <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
//         <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
//           <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
//             Reset Password
//           </h2>

//           <form
//             className="mt-4 space-y-4 lg:mt-5 md:space-y-5"
//             action="#"
//             onSubmit={handleSubmit(onSubmit)}
//             noValidate
//           >
//             <div>
//               <label
//                 htmlFor="password"
//                 className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
//               >
//                 New Password
//               </label>
//               <input
//                 type="password"
//                 name="password"
//                 id="password"
//                 {...register("password")}
//                 placeholder="••••••••"
//                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
//                 required
//               />
//               {errors.password && (
//                 <p className="text-red-500 text-xs italic">
//                   {errors.password.message}
//                 </p>
//               )}
//             </div>
//             <div>
//               <label
//                 htmlFor="confirm-password"
//                 className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
//               >
//                 Confirm password
//               </label>
//               <input
//                 type="password"
//                 name="confirm-password"
//                 id="confirm-password"
//                 {...register("confirmPassword")}
//                 placeholder="••••••••"
//                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
//                 required
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="w-full text-primary-700 bg-white border border-primary-600 hover:bg-primary-50 focus:ring-4 focus:outline-none focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-100 dark:text-primary-700 dark:hover:bg-gray-200 dark:focus:ring-primary-300"
//             >
//                 Reset Password
//             </button>
//           </form>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ResetPassword;

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
          <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Reset Password
          </h2>

          <form className="mt-4 space-y-4 lg:mt-5 md:space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                  type={showPwd ? "text" : "password"}
                  id="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute inset-y-0 right-3 my-auto"
                >
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs italic">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"} // 👈 same toggle
                  id="confirm-password"
                  {...register("confirmPassword")}
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute inset-y-0 right-3 my-auto"
                >
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs italic">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-primary-700 bg-white border border-primary-600 hover:bg-primary-50 focus:ring-4 focus:outline-none focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-100 dark:text-primary-700 dark:hover:bg-gray-200 dark:focus:ring-primary-300"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
