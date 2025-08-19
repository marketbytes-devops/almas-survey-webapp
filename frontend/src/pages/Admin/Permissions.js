import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import axios from "axios";
import Modal from "../../components/Modal";

const Permissions = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const permissionForm = useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/auth/users/list/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const usersWithPermissions = await Promise.all(
        response.data.map(async (user) => {
          const permResponse = await axios.get(`http://127.0.0.1:8000/api/auth/permissions/${user.id}/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          return { ...user, permissions: permResponse.data.permissions || [] };
        })
      );
      setUsers(usersWithPermissions);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const onSubmit = async (data) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/auth/permissions/${selectedUser.id}/`,
        { permissions: Object.keys(data).filter((key) => data[key]).map(key => {
          return key === "processingEnquiries" ? "processing-enquiries" :
                 key === "followUps" ? "follow-ups" :
                 key === "scheduledSurveys" ? "scheduled-surveys" :
                 key === "newEnquiries" ? "new-enquiries" : key;
        }) },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchUsers();
      setIsModalOpen(false);
      permissionForm.reset();
    } catch (err) {
      console.error("Failed to update permissions", err);
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    permissionForm.reset({
      dashboard: user.permissions.includes("dashboard"),
      enquiries: user.permissions.includes("enquiries"),
      processingEnquiries: user.permissions.includes("processing-enquiries"),
      followUps: user.permissions.includes("follow-ups"),
      scheduledSurveys: user.permissions.includes("scheduled-surveys"),
      newEnquiries: user.permissions.includes("new-enquiries"),
      profile: user.permissions.includes("profile"),
      users: user.permissions.includes("users"),
      permissions: user.permissions.includes("permissions"),
    });
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto">
      <div className="space-y-4">
        {users.map((user, index) => (
          <div key={user.id} className="rounded-lg p-5 bg-white shadow-sm">
            <div className="space-y-2 text-[#2d4a5e] text-sm sm:text-base">
              <p><strong>Sl No:</strong> {index + 1}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Permissions:</strong> {user.permissions.join(", ") || "None"}</p>
              <button
                onClick={() => openModal(user)}
                className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-3 rounded hover:bg-[#4c7085]"
              >
                Edit Permissions
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Edit Permissions for ${selectedUser?.name}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="permission-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              Update Permissions
            </button>
          </>
        }
      >
        <FormProvider {...permissionForm}>
          <form id="permission-form" onSubmit={permissionForm.handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: "dashboard", label: "Dashboard" },
              { name: "enquiries", label: "Enquiries" },
              { name: "processingEnquiries", label: "Processing Enquiries" },
              { name: "followUps", label: "Follow Ups" },
              { name: "scheduledSurveys", label: "Scheduled Surveys" },
              { name: "newEnquiries", label: "New Enquiries" },
              { name: "profile", label: "Profile" },
              { name: "users", label: "Users" },
              { name: "permissions", label: "Permissions" },
            ].map((item) => (
              <div key={item.name} className="flex items-center">
                <input
                  type="checkbox"
                  {...permissionForm.register(item.name)}
                  disabled={selectedUser?.role === "survey-admin" && ["dashboard", "profile", "users", "permissions"].includes(item.name)}
                  className="mr-2 w-5 h-5 disabled:opacity-50"
                />
                <label className="text-[#2d4a5e] text-sm sm:text-base">{item.label}</label>
              </div>
            ))}
          </form>
        </FormProvider>
      </Modal>
    </div>
  );
};

export default Permissions;