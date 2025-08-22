import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/Input";

const Profile = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/auth/users/list/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          const currentUser = response.data.find(u => u.email === user.email);
          if (currentUser) {
            const permResponse = await axios.get(`http://127.0.0.1:8000/api/auth/permissions/${currentUser.id}/`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setUserData({
              ...currentUser,
              permissions: permResponse.data.permissions || [],
            });
            reset({
              name: currentUser.name,
              email: currentUser.email,
            });
          }
        } catch (err) {
          console.error("Failed to fetch user data", err);
        }
      };
      fetchUserData();
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/auth/change-password/",
        { email: user.email, current_password: data.current_password, new_password: data.new_password },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMessage("Password changed successfully");
      setError("");
      reset({ current_password: "", new_password: "" });
    } catch (err) {
      setError("Failed to change password");
      setMessage("");
    }
  };

  if (!user || !user.permissions.includes("profile")) {
    return <div className="text-[#2d4a5e] text-center">Access denied. You need the 'profile' permission to view this page.</div>;
  }

  if (!userData) {
    return <div className="text-[#2d4a5e] text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-[#2d4a5e] mb-4">User Profile</h2>
        <p className="text-[#2d4a5e] mb-4"><strong>Name:</strong> {userData.name}</p>
        <p className="text-[#2d4a5e] mb-4"><strong>Email:</strong> {userData.email}</p>
        <p className="text-[#2d4a5e] mb-4"><strong>Role:</strong> {userData.roles.join(", ") || "None"}</p>
        <h3 className="text-xl font-semibold text-[#2d4a5e] mb-4">Change Password</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            name="current_password"
            type="password"
            rules={{ required: "Current password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } }}
            register={register}
            errors={errors}
          />
          <Input
            label="New Password"
            name="new_password"
            type="password"
            rules={{ required: "New password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } }}
            register={register}
            errors={errors}
          />
          {message && <p className="text-green-500 text-sm">{message}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085]"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;