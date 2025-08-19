import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import axios from "axios";
import Input from "../../components/Input";

const ResetPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await axios.post("http://127.0.0.1:8000/api/auth/reset-password/", {
        email: data.email,
        new_password: data.password,
        confirm_new_password: data.confirm_password,
      });
      setMessage("Password reset successfully");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Invalid OTP or email");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-[#2d4a5e] mb-6 text-center">Reset Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            rules={{ required: "Email is required" }}
            register={register}
            errors={errors}
          />
          <Input
            label="OTP"
            name="otp"
            type="text"
            rules={{ required: "OTP is required", pattern: { value: /^\d{6}$/, message: "OTP must be 6 digits" } }}
            register={register}
            errors={errors}
          />
          <Input
            label="New Password"
            name="password"
            type="password"
            rules={{ required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } }}
            register={register}
            errors={errors}
          />
          <Input
            label="Confirm New Password"
            name="confirm_password"
            type="password"
            rules={{ required: "Confirm password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } }}
            register={register}
            errors={errors}
          />
          {message && <p className="text-green-500 text-sm">{message}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 rounded hover:bg-[#4c7085]"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;