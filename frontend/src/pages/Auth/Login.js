import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/Input";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/auth/login/", data);
      login(
        { id: response.data.id, email: data.email, roles: response.data.roles },
        response.data.access,
        response.data.refresh
      );
      navigate("/");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#2d4a5e] mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            rules={{ required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } }}
            register={register}
            errors={errors}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            rules={{ required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } }}
            register={register}
            errors={errors}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 rounded hover:bg-[#4c7085]"
          >
            Login
          </button>
        </form>
        <p className="text-center text-[#2d4a5e] text-sm mt-4">
          Forgot your password? <a href="/forgot-password" className="underline">Reset it</a>
        </p>
      </div>
    </div>
  );
};

export default Login;