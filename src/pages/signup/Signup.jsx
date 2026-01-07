import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios"

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const schema = yup.object({
  firstName: yup.string().trim().required("First Name is required").min(2, "Too short"),
  lastName: yup.string().trim().required("Last Name is required").min(2, "Too short"),
  email: yup.string().trim().required("Email is required").email("Invalid email format").matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/,
      "Invalid email format or contains forbidden characters"
    )
})

const Signup = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (formData) => {
    try {
      const trimmedData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
      };

    const response = await axios.post(`${backendUrl}/api/auth/register`, trimmedData);
     console.log(response)
      toast.success("Signup successful! Check your email.");
      reset();
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      const msg = error?.response?.data?.message || "Signup failed. Please try again.";
      toast.error(msg);
      console.error("Signup error:", error);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        ></a>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Create an account
            </h1>
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div>
                <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register("firstName")}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="John"
                  required=""
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs italic">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register("lastName")}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Doe"
                  required=""
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs italic">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Your email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required=""
                />
                {errors.email && (
                  <p className="text-red-500 text-xs italic">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-primary-700 bg-white border border-primary-600 hover:bg-primary-50 focus:ring-4 focus:outline-none focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-100 dark:text-primary-700 dark:hover:bg-gray-200 dark:focus:ring-primary-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Creating account..." : "Sign up"}
              </button>

              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
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
};

export default Signup;