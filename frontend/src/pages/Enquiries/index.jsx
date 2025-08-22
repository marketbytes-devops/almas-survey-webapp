import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FormProvider, useForm } from "react-hook-form";
import { FaPhoneAlt, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import axios from "axios";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { useAuth } from "../../hooks/useAuth";

const rowVariants = {
  hover: { backgroundColor: "#f3f4f6" },
  rest: { backgroundColor: "#ffffff" },
};

const Enquiries = () => {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [emailReceivers, setEmailReceivers] = useState([]);
  const [error, setError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const addForm = useForm();
  const editForm = useForm();
  const assignForm = useForm();

  const serviceOptions = [
    { value: "localMove", label: "Local Move" },
    { value: "internationalMove", label: "International Move" },
    { value: "carExport", label: "Car Import and Export" },
    { value: "storageServices", label: "Storage Services" },
    { value: "logistics", label: "Logistics" },
  ];

  useEffect(() => {
    if (!user || !user.permissions.includes("dashboard")) return;
    fetchEnquiries();
    fetchEmailReceivers();
  }, [user]);

  const fetchEnquiries = async () => {
    try {
      setError(null);
      const response = await axios.get("http://127.0.0.1:8000/api/contacts/enquiries/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { has_survey: "false" },
      });
      setEnquiries(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setEnquiries([]);
      setError(err.response?.data?.error || "Failed to fetch enquiries. Please try again.");
    }
  };

  const fetchEmailReceivers = async () => {
    try {
      setError(null);
      const response = await axios.get("http://127.0.0.1:8000/api/auth/users/list/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEmailReceivers(
        response.data
          .filter(u => u.enable_email_receiver)
          .map(u => ({ value: u.email, label: u.name || u.email }))
      );
    } catch (err) {
      setError("Failed to fetch email receivers. Please try again.");
    }
  };

  const onAddSubmit = async (data) => {
    try {
      setError(null);
      const token = await new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(import.meta.env.VITE_RECAPTCHA_SITE_KEY, { action: "submit_enquiry" })
            .then(resolve)
            .catch(reject);
        });
      });
      await axios.post(
        "http://127.0.0.1:8000/api/contacts/enquiries/",
        {
          fullName: data.customerName,
          phoneNumber: data.phone,
          email: data.email,
          serviceType: data.service,
          message: data.message,
          recaptchaToken: token,
          refererUrl: window.location.href,
          submittedUrl: window.location.href,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchEnquiries();
      setIsAddOpen(false);
      addForm.reset();
    } catch (err) {
      const errorMessage = err.response?.data
        ? Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join("; ")
        : err.message || "Failed to add enquiry. Please try again.";
      setError(errorMessage);
    }
  };

  const onEditSubmit = async (data) => {
    try {
      setError(null);
      await axios.patch(
        `http://127.0.0.1:8000/api/contacts/enquiries/${selectedEnquiry.id}/`,
        {
          fullName: data.customerName,
          phoneNumber: data.phone,
          email: data.email,
          serviceType: data.service,
          message: data.message,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchEnquiries();
      setIsEditOpen(false);
      editForm.reset();
    } catch (err) {
      const errorMessage = err.response?.data
        ? Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join("; ")
        : err.message || "Failed to update enquiry.";
      setError(errorMessage);
    }
  };

  const onAssignSubmit = async (data) => {
    try {
      setError(null);
      await axios.patch(
        `http://127.0.0.1:8000/api/contacts/enquiries/${selectedEnquiry.id}/`,
        {
          assigned_user_email: data.emailReceiver || null,
          note: data.note || null,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchEnquiries();
      setIsAssignOpen(false);
      assignForm.reset();
    } catch (err) {
      const errorMessage = err.response?.data
        ? Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join("; ")
        : err.message || "Failed to assign enquiry.";
      setError(errorMessage);
    }
  };

  const onDelete = async () => {
    try {
      setError(null);
      await axios.delete(
        `http://127.0.0.1:8000/api/contacts/enquiries/${selectedEnquiry.id}/delete/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchEnquiries();
      setIsDeleteOpen(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to delete enquiry.";
      setError(errorMessage);
    }
  };

  const openEditModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    editForm.reset({
      customerName: enquiry.fullName,
      phone: enquiry.phoneNumber,
      email: enquiry.email,
      service: enquiry.serviceType,
      message: enquiry.message,
    });
    setIsEditOpen(true);
  };

  const openAssignModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    assignForm.reset({
      emailReceiver: enquiry.assigned_user_email,
      note: enquiry.note,
    });
    setIsAssignOpen(true);
  };

  const openDeleteModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsDeleteOpen(true);
  };

  const openPhoneModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsPhoneModalOpen(true);
  };

  if (!user || !user.permissions.includes("dashboard")) {
    return <div className="text-[#2d4a5e] text-center">Access denied. You need the 'dashboard' permission to view enquiries.</div>;
  }

  return (
    <div className="container mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      <button
        onClick={() => setIsAddOpen(true)}
        className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded mb-4"
      >
        Add New Enquiry
      </button>
      {enquiries.length === 0 ? (
        <div className="text-center text-[#2d4a5e] text-sm sm:text-base p-5 bg-white shadow-sm rounded-lg">
          No Enquiries Found
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enquiry, index) => (
            <motion.div
              key={enquiry.id}
              className="rounded-lg p-5 bg-white shadow-sm"
              variants={rowVariants}
              initial="rest"
              whileHover="hover"
            >
              <div className="space-y-2 text-[#2d4a5e] text-sm sm:text-base">
                <p><strong>Sl No:</strong> {index + 1}</p>
                <p><strong>Date & Time:</strong> {new Date(enquiry.created_at).toLocaleString()}</p>
                <p><strong>Customer Name:</strong> {enquiry.fullName || "N/A"}</p>
                <p className="flex items-center gap-2">
                  <strong>Phone:</strong>
                  {enquiry.phoneNumber ? (
                    <button
                      onClick={() => openPhoneModal(enquiry)}
                      className="flex items-center gap-2 text-[#4c7085]"
                    >
                      <FaPhoneAlt className="w-3 h-3" /> {enquiry.phoneNumber}
                    </button>
                  ) : "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <strong>Email:</strong>
                  {enquiry.email ? (
                    <a
                      href={`mailto:${enquiry.email}`}
                      className="flex items-center gap-2 text-[#4c7085]"
                    >
                      <FaEnvelope className="w-3 h-3" /> {enquiry.email}
                    </a>
                  ) : "N/A"}
                </p>
                <p><strong>Service:</strong> {serviceOptions.find(opt => opt.value === enquiry.serviceType)?.label || enquiry.serviceType || "N/A"}</p>
                <p><strong>Message:</strong> {enquiry.message || "N/A"}</p>
                <p><strong>Note:</strong> {enquiry.note || "N/A"}</p>
                <p><strong>Assigned To:</strong> {enquiry.assigned_user_email || "Unassigned"}</p>
                <div className="flex flex-wrap gap-2 pt-3">
                  <button
                    onClick={() => openAssignModal(enquiry)}
                    className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-sm py-2 px-3 rounded"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => openEditModal(enquiry)}
                    className="bg-gray-500 text-white text-sm py-2 px-3 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(enquiry)}
                    className="bg-red-500 text-white text-sm py-2 px-3 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {/* Add Enquiry Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Enquiry"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-enquiry-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded"
            >
              Add Enquiry
            </button>
          </>
        }
      >
        <FormProvider {...addForm}>
          <form id="add-enquiry-form" onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
            <Input
              label="Customer Name"
              name="customerName"
              type="text"
              rules={{ required: "Customer Name is required" }}
            />
            <Input
              label="Phone Number"
              name="phone"
              type="text"
              rules={{
                required: "Phone Number is required",
                pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10-digit phone number" },
              }}
            />
            <Input
              label="Email Id"
              name="email"
              type="email"
              rules={{
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
              }}
            />
            <Input
              label="Service Required"
              name="service"
              type="select"
              options={serviceOptions}
              rules={{ required: "Service Required is required" }}
            />
            <Input
              label="Message"
              name="message"
              type="textarea"
              rules={{ required: "Message is required" }}
            />
          </form>
        </FormProvider>
      </Modal>
      {/* Edit Enquiry Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Enquiry"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-enquiry-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded"
            >
              Update Enquiry
            </button>
          </>
        }
      >
        <FormProvider {...editForm}>
          <form id="edit-enquiry-form" onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <Input
              label="Customer Name"
              name="customerName"
              type="text"
              rules={{ required: "Customer Name is required" }}
            />
            <Input
              label="Phone Number"
              name="phone"
              type="text"
              rules={{
                required: "Phone Number is required",
                pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10-digit phone number" },
              }}
            />
            <Input
              label="Email Id"
              name="email"
              type="email"
              rules={{
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
              }}
            />
            <Input
              label="Service Required"
              name="service"
              type="select"
              options={serviceOptions}
              rules={{ required: "Service Required is required" }}
            />
            <Input
              label="Message"
              name="message"
              type="textarea"
              rules={{ required: "Message is required" }}
            />
          </form>
        </FormProvider>
      </Modal>
      {/* Assign Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Assign Enquiry"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="assign-enquiry-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded"
            >
              Assign
            </button>
          </>
        }
      >
        <FormProvider {...assignForm}>
          <form id="assign-enquiry-form" onSubmit={assignForm.handleSubmit(onAssignSubmit)} className="space-y-4">
            <Input
              label="Assign To"
              name="emailReceiver"
              type="select"
              options={[{ value: "", label: "Unassign" }, ...emailReceivers]}
              rules={{ required: false }}
            />
            <Input
              label="Note (Optional)"
              name="note"
              type="textarea"
            />
          </form>
        </FormProvider>
      </Modal>
      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Enquiry"
        footer={
          <>
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="bg-red-500 text-white py-2 px-3 rounded"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-[#2d4a5e] text-sm sm:text-base">
          Are you sure you want to delete this enquiry?
        </p>
      </Modal>
      {/* Phone Modal */}
      <Modal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        title="Contact Options"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsPhoneModalOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-[#2d4a5e] text-sm sm:text-base">
            Choose how to contact {selectedEnquiry?.fullName || "N/A"}:
          </p>
          <div className="flex flex-col gap-3">
            {selectedEnquiry?.phoneNumber ? (
              <>
                <a
                  href={`tel:${selectedEnquiry.phoneNumber}`}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded"
                >
                  <FaPhoneAlt className="w-5 h-5" /> Call
                </a>
                <a
                  href={`https://wa.me/${selectedEnquiry.phoneNumber}`}
                  className="flex items-center gap-2 bg-green-500 text-white py-2 px-4 rounded"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp className="w-5 h-5" /> WhatsApp
                </a>
              </>
            ) : (
              <p className="text-[#2d4a5e] text-sm sm:text-base">No phone number available</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Enquiries;