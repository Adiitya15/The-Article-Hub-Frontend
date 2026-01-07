
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { SlArrowLeftCircle } from "react-icons/sl";
import axiosInstance from "../../utils/axios.interceptor";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";

const schema = yup.object({
  firstName: yup.string().trim().required("First Name is required").min(2, "Too short"),
  lastName: yup.string().trim().required("Last Name is required").min(2, "Too short"),
  email: yup
  .string()
  .trim()
  .required("Email is required")
  .matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    "Email must have a valid domain (e.g., .com, .org)"
  )
})

export default function CreateUser() {

const navigate = useNavigate()

 const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({resolver:yupResolver(schema)})

  
  const onSubmit = async (data) => {
  
    try {

      await axiosInstance.post(
        `user/create`,
        data
      );

      toast.success("User created successfully");
      navigate("/users"); // back to list
    } catch (err) {
      toast.error("Failed to create user");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <button
        type="button"
        onClick={() => navigate("/users")}
        className="mb-4 text-sm text-gray-600 hover:underline"
      >
        <SlArrowLeftCircle />
      </button>

      {/* ✅ CHANGE: handleSubmit wraps onSubmit */}
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold">Create User</h2>

        {/* ✅ ADD wrapper div and error message */}
        <div>
          <input
            {...register("firstName")} // ✅ CHANGE: use register instead of name + onChange
            placeholder="First Name"
            className="w-full border p-2 rounded"
            // ❌ REMOVE: required, name, onChange
          />
          {/* ✅ ADD error message */}
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
          )}
        </div>

        {/* ✅ ADD wrapper div and error message */}
        <div>
          <input
            {...register("lastName")} // ✅ CHANGE: use register
            placeholder="Last Name"
            className="w-full border p-2 rounded"
            // ❌ REMOVE: required, name, onChange
          />
          {/* ✅ ADD error message */}
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
          )}
        </div>

        {/* ✅ ADD wrapper div and error message */}
        <div>
          <input
            {...register("email")} // ✅ CHANGE: use register
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            // ❌ REMOVE: required, name, onChange
          />
          {/* ✅ ADD error message */}
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* ✅ ADD wrapper div and error message */}
        <div>
          <select
            {...register("role")} // ✅ CHANGE: use register
            className="w-full border p-2 rounded"
            // ❌ REMOVE: name, onChange
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {/* ✅ ADD error message */}
          {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Create User
        </button>
      </form>
    </div>
  );
}
