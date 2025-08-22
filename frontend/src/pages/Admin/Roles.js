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

const Roles = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.permissions.includes("roles")) return;
    fetchRoles();
  }, [user]);

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
      await axios.post("http://127.0.0.1:8000/api/auth/roles/", data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchRoles();
      setIsAddOpen(false);
      reset();
    } catch (err) {
      console.error("Failed to create role", err);
    }
  };

  const onDelete = async () => {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/auth/roles/${selectedRole.id}/`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        fetchRoles();
        setIsDeleteOpen(false);
        setSelectedRole(null);
        setError(null);
      } catch (err) {
        console.error("Failed to delete role", err);
        setError(err.response?.data?.error || "Failed to delete role. Please try again.");
      }
    };

  const openDeleteModal = (role) => {
    setSelectedRole(role);
    setIsDeleteOpen(true);
  };

  if (!user || !user.permissions.includes("roles")) {
    return <div className="text-[#2d4a5e] text-center">Access denied. You need the 'roles' permission to manage roles.</div>;
  }

  return (
    <div className="container mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <button
        onClick={() => setIsAddOpen(true)}
        className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded mb-4"
      >
        Add Role
      </button>
      <div className="space-y-4">
        {roles.map((role, index) => (
          <motion.div
            key={role.id}
            className="rounded-lg p-5 bg-white shadow-sm"
            variants={rowVariants}
            initial="rest"
            whileHover="hover"
          >
            <div className="space-y-2 text-[#2d4a5e] text-sm sm:text-base">
              <p><strong>Sl No:</strong> {index + 1}</p>
              <p><strong>Name:</strong> {role.name}</p>
              <p><strong>Description:</strong> {role.description || "No description"}</p>
              <div className="flex flex-wrap gap-2 pt-3">
                <button
                  onClick={() => openDeleteModal(role)}
                  className="bg-red-500 text-white text-sm py-2 px-3 rounded hover:bg-red-600"
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
        onClose={() => setIsAddOpen(false)}
        title="Add Role"
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
              form="add-role-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              Add Role
            </button>
          </>
        }
      >
        <form id="add-role-form" onSubmit={handleSubmit(onAddSubmit)} className="space-y-4">
          <Input
            label="Role Name"
            name="name"
            type="text"
            rules={{ required: "Role name is required" }}
            register={register}
            errors={errors}
          />
          <Input
            label="Description"
            name="description"
            type="text"
            rules={{ required: false }}
            register={register}
            errors={errors}
          />
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Role"
        footer={
          <>
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600 text-sm sm:text-base"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-[#2d4a5e] text-sm sm:text-base">
          Are you sure you want to delete the role "{selectedRole?.name}"?
        </p>
      </Modal>
    </div>
  );
};

export default Roles;