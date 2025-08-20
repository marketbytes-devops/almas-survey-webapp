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
  const [salespersons, setSalespersons] = useState([]);
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
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${import.meta.env.VITE_RECAPTCHA_SITE_KEY}`;
    script.async = true;
    document.body.appendChild(script);

    fetchEnquiries();
    if (user?.role === "survey-admin") {
      fetchSalespersons();
    }

    return () => {
      document.body.removeChild(script);
    };
  }, [user]);

  const fetchEnquiries = async () => {
    try {
      setError(null);
      const params = user?.role === "survey-admin" ? { unassigned: "true" } : { has_survey: "false" };
      const response = await axios.get("http://127.0.0.1:8000/api/contacts/enquiries/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params,
      });
      setEnquiries(response.data);
    } catch (err) {
      console.error("Failed to fetch enquiries", err);
      setError(err.response?.data?.error || formatError(err.response?.data) || "Failed to fetch enquiries. Please try again.");
    }
  };

  const fetchSalespersons = async () => {
    try {
      setError(null);
      const response = await axios.get("http://127.0.0.1:8000/api/auth/users/list/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSalespersons(response.data.map((user) => ({ value: user.email, label: user.name })));
    } catch (err) {
      console.error("Failed to fetch salespersons", err);
      setError(err.response?.data?.error || formatError(err.response?.data) || "Failed to fetch salespersons. Please try again.");
    }
  };

  const formatError = (errorData) => {
    if (!errorData) return null;
    return Object.entries(errorData)
      .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
      .join("; ");
  };

  const onAddSubmit = async (data) => {
    try {
      setError(null);
      await window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(import.meta.env.VITE_RECAPTCHA_SITE_KEY, { action: "submit_enquiry" })
          .then(async (token) => {
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
          });
      });
    } catch (err) {
      console.error("Failed to add enquiry", err);
      setError(err.response?.data?.error || formatError(err.response?.data) || "Failed to add enquiry. Please try again.");
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
      console.error("Failed to update enquiry", err);
      setError(err.response?.data?.error || formatError(err.response?.data) || "Failed to update enquiry. Please try again.");
    }
  };

  const onAssignSubmit = async (data) => {
      try {
        setError(null);
        const response = await axios.patch(
          `http://127.0.0.1:8000/api/contacts/enquiries/${selectedEnquiry.id}/`,
          { salesperson_email: data.salesperson, note: data.note || null },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setEnquiries((prev) =>
          prev.map((enquiry) =>
            enquiry.id === selectedEnquiry.id
              ? { ...enquiry, salesperson_email: response.data.salesperson_email, note: response.data.note }
              : enquiry
          )
        );
        setIsAssignOpen(false);
        assignForm.reset();
      } catch (err) {
        console.error("Failed to assign enquiry", err);
        const errorMessage =
          err.response?.data?.error ||
          err.response?.data?.salesperson_email?.[0] ||
          formatError(err.response?.data) ||
          "Failed to assign enquiry. Please try again.";
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
      console.error("Failed to delete enquiry", err);
      setError(err.response?.data?.error || formatError(err.response?.data) || "Failed to delete enquiry. Please try again.");
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
    assignForm.reset({ salesperson: enquiry.salesperson_email || "", note: enquiry.note || "" });
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

  return (
    <div className="container mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      {user?.role === "survey-admin" && (
        <div className="mb-6">
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-sm sm:text-base font-medium py-2 px-4 rounded hover:bg-[#4c7085]"
          >
            Add New Enquiry
          </button>
        </div>
      )}
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
                      className="flex items-center justify-center gap-2 text-[#4c7085] hover:text-[#2d4a5e]"
                      aria-label="Contact via phone or WhatsApp"
                    >
                      <FaPhoneAlt className="w-3 h-3" /> {enquiry.phoneNumber}
                    </button>
                  ) : (
                    "N/A"
                  )}
                </p>
                <p className="flex items-center gap-2">
                  <strong>Email:</strong>
                  {enquiry.email ? (
                    <a
                      href={`mailto:${enquiry.email}`}
                      className="flex items-center justify-center gap-2 text-[#4c7085] hover:text-[#2d4a5e]"
                      aria-label="Email customer"
                    >
                      <FaEnvelope className="w-3 h-3" /> {enquiry.email}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
                <p><strong>Service:</strong> {enquiry.serviceType || "N/A"}</p>
                <p><strong>Message:</strong> {enquiry.message || "N/A"}</p>
                <p><strong>Note:</strong> {enquiry.note || "N/A"}</p>
                <p><strong>Salesperson:</strong> {enquiry.salesperson_email || "Unassigned"}</p>
                {user?.role === "survey-admin" && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    <button
                      onClick={() => openAssignModal(enquiry)}
                      className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-sm py-2 px-3 rounded hover:bg-[#4c7085]"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => openEditModal(enquiry)}
                      className="bg-gray-500 text-white text-sm py-2 px-3 rounded hover:bg-gray-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(enquiry)}
                      className="bg-red-500 text-white text-sm py-2 px-3 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Enquiry"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-enquiry-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085] text-sm sm:text-base"
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
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Enter a valid 10-digit phone number",
                },
              }}
            />
            <Input
              label="Email Id"
              name="email"
              type="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
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
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Enquiry"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-enquiry-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085] text-sm sm:text-base"
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
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Enter a valid 10-digit phone number",
                },
              }}
            />
            <Input
              label="Email Id"
              name="email"
              type="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
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
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Assign Enquiry"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="assign-enquiry-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085] text-sm sm:text-base"
            >
              Assign
            </button>
          </>
        }
      >
        <FormProvider {...assignForm}>
          <form id="assign-enquiry-form" onSubmit={assignForm.handleSubmit(onAssignSubmit)} className="space-y-4">
            <Input
              label="Salesperson"
              name="salesperson"
              type="select"
              options={salespersons}
              rules={{ required: "Salesperson is required" }}
            />
            <Input
              label="Note (Optional)"
              name="note"
              type="textarea"
            />
          </form>
        </FormProvider>
      </Modal>
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Enquiry"
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
          Are you sure you want to delete this enquiry?
        </p>
      </Modal>
      <Modal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        title="Contact Options"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsPhoneModalOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 text-sm sm:text-base"
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
                  className="flex items-center gap-2 bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085] text-sm sm:text-base"
                >
                  <FaPhoneAlt className="w-5 h-5" />
                  Call
                </a>
                <a
                  href={`https://wa.me/${selectedEnquiry.phoneNumber}`}
                  className="flex items-center gap-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-sm sm:text-base"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  WhatsApp
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