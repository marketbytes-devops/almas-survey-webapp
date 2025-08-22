import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { motion } from "framer-motion";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { useAuth } from "../../hooks/useAuth";

const rowVariants = {
  hover: { backgroundColor: "#f3f4f6" },
  rest: { backgroundColor: "#ffffff" },
};

const Users = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const { user, assignRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [enableEmailReceiver, setEnableEmailReceiver] = useState(false);

  useEffect(() => {
    if (!user || !user.permissions.includes("users")) return;
    fetchUsers();
    fetchRoles();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/auth/users/list/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/auth/roles/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRoles(response.data);
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  const onAddSubmit = async (data) => {
    try {
      const userResponse = await axios.post("http://127.0.0.1:8000/api/auth/users/", {
        name: data.name,
        email: data.email,
        password: autoGenerate ? undefined : data.password,
        auto_generate_password: autoGenerate,
        enable_email_receiver: enableEmailReceiver,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (data.role_name) {
        await assignRole(data.role_name, data.email);
      }
      fetchUsers();
      setIsAddOpen(false);
      reset();
      setAutoGenerate(false);
      setEnableEmailReceiver(false);
    } catch (err) {
      console.error("Failed to create user or assign role", err);
    }
  };

  const onDelete = async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/auth/users/${selectedUser.id}/delete/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchUsers();
      setIsDeleteOpen(false);
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  if (!user || !user.permissions.includes("users")) {
    return <div className="text-[#2d4a5e] text-center">Access denied. You need the 'users' permission to manage users.</div>;
  }

  return (
    <div className="container mx-auto">
      <button
        onClick={() => setIsAddOpen(true)}
        className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded mb-4"
      >
        Add User
      </button>
      <div className="space-y-4">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            className="rounded-lg p-5 bg-white shadow-sm"
            variants={rowVariants}
            initial="rest"
            whileHover="hover"
          >
            <div className="space-y-2 text-[#2d4a5e] text-sm sm:text-base">
              <p><strong>Sl No:</strong> {index + 1}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Roles:</strong> {user.roles.join(", ") || "None"}</p>
              <p><strong>Email Receiver:</strong> {user.enable_email_receiver ? "Enabled" : "Disabled"}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setIsDeleteOpen(true);
                  }}
                  className="bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setAutoGenerate(false);
          setEnableEmailReceiver(false);
          reset();
        }}
        title="Add User"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setAutoGenerate(false);
                setEnableEmailReceiver(false);
                reset();
              }}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-user-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              Add User
            </button>
          </>
        }
      >
        <form id="add-user-form" onSubmit={handleSubmit(onAddSubmit)} className="space-y-4">
          <Input
            label="Name"
            name="name"
            type="text"
            rules={{ required: "Name is required" }}
            register={register}
            errors={errors}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            rules={{
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
            }}
            register={register}
            errors={errors}
          />
          <div>
            <label className="block text-sm font-medium text-[#2d4a5e]">Role</label>
            <select
              {...register("role_name", { required: "Role is required" })}
              className="w-full p-2 border rounded text-[#2d4a5e] text-sm"
            >
              <option value="">Select a role</option>
              {roles.map(role => (
                <option key={role.id} value={role.name}>{role.name}</option>
              ))}
            </select>
            {errors.role_name && <p className="text-red-500 text-sm">{errors.role_name.message}</p>}
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={autoGenerate}
              onChange={(e) => {
                setAutoGenerate(e.target.checked);
                if (e.target.checked) {
                  setValue("password", "");
                  setValue("confirm_password", "");
                }
              }}
              className="mr-2 w-5 h-5"
            />
            <label className="text-[#2d4a5e] text-sm">Auto-generate password</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={enableEmailReceiver}
              onChange={(e) => setEnableEmailReceiver(e.target.checked)}
              className="mr-2 w-5 h-5"
            />
            <label className="text-[#2d4a5e] text-sm">Enable Email Receiver</label>
          </div>
          {!autoGenerate && (
            <>
              <Input
                label="Password"
                name="password"
                type="password"
                rules={{ required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } }}
                register={register}
                errors={errors}
              />
              <Input
                label="Confirm Password"
                name="confirm_password"
                type="password"
                rules={{
                  required: "Confirm password is required",
                  validate: (value, { password }) => value === password || "Passwords do not match"
                }}
                register={register}
                errors={errors}
              />
            </>
          )}
        </form>
      </Modal>
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete User"
        footer={
          <>
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-[#2d4a5e] text-sm sm:text-base">
          Are you sure you want to delete {selectedUser?.name}?
        </p>
      </Modal>
    </div>
  );
};

export default Users;