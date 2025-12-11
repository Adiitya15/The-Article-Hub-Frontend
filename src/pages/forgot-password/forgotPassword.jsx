import React, { useState } from "react";
import axios from "axios";
import {  toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    if(error) setError("")
    const value = e.target.value;
    setEmail(value);
  };

  const onSubmit = async () => {
    try {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

      if (!regex.test(email)) {
        setError("Email is not valid.")
        return
      } 
      const res = await axios.post(
        `${backendUrl}/api/auth/forgot-password`,
         {email}
        )
        console.log("RES: >", res)
        toast.success(res.data.message)
        setTimeout(() => navigate("/login"), 2000)
    }
     catch (err) {
      const message = err.response?.data?.message || "Failed to reset password";
      toast.error(message);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Forgot Password
            </h1>
            <form className="space-y-4 md:space-y-6" noValidate>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Your email
                </label>
                <input
                  type="email"
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                />
                {error && (
                  <p className="text-red-500 text-xs italic">{error}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onSubmit()}
                className="w-full text-primary-700 bg-white border border-primary-600 hover:bg-primary-50 focus:ring-4 focus:outline-none focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-100 dark:text-primary-700 dark:hover:bg-gray-200 dark:focus:ring-primary-300"
              >
                Send Email
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
