import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { motion } from "framer-motion";
import Modal from "../../components/Modal";
import Input from "../../components/Input";

const rowVariants = {
  hover: { backgroundColor: "#f3f4f6" },
  rest: { backgroundColor: "#ffffff" },
};

const Users = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [users, setUsers] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const onAddSubmit = async (data) => {
    try {
      await axios.post("http://127.0.0.1:8000/api/auth/users/", data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchUsers();
      setIsAddOpen(false);
      reset();
    } catch (err) {
      console.error("Failed to create user", err);
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

  return (
    <div className="container mx-auto">
      <button
        onClick={() => setIsAddOpen(true)}
        className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded mb-4"
      >
        Add Sales Person
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
              <p><strong>Role:</strong> {user.role}</p>
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
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Sales Person"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-user-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              Add Sales Person
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
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
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