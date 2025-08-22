import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FormProvider, useForm } from "react-hook-form";
import { FaPhoneAlt, FaWhatsapp, FaEnvelope, FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { useAuth } from "../../hooks/useAuth";

const rowVariants = {
  hover: { backgroundColor: "#f3f4f6" },
  rest: { backgroundColor: "#ffffff" },
};

const NewEnquiries = () => {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [error, setError] = useState(null);
  const [isContactStatusOpen, setIsContactStatusOpen] = useState(false);
  const [isScheduleSurveyOpen, setIsScheduleSurveyOpen] = useState(false);
  const [isCancelSurveyOpen, setIsCancelSurveyOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const contactStatusForm = useForm();
  const scheduleSurveyForm = useForm();
  const cancelSurveyForm = useForm();

  const serviceOptions = [
    { value: "localMove", label: "Local Move" },
    { value: "internationalMove", label: "International Move" },
    { value: "carExport", label: "Car Import and Export" },
    { value: "storageServices", label: "Storage Services" },
    { value: "logistics", label: "Logistics" },
  ];

  const surveySlots = [
    { value: "2025-08-20T09:00:00", label: "2025-08-20 09:00 AM" },
    { value: "2025-08-20T14:00:00", label: "2025-08-20 02:00 PM" },
    { value: "2025-08-21T10:00:00", label: "2025-08-21 10:00 AM" },
  ];

  useEffect(() => {
    if (!user || !user.permissions.includes("dashboard")) return;
    fetchEnquiries();
  }, [user]);

  const fetchEnquiries = async () => {
    try {
      setError(null);
      const response = await axios.get("http://127.0.0.1:8000/api/contacts/enquiries/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { assigned_user_email: user.email }, // Filter by assigned user
      });
      setEnquiries(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setEnquiries([]);
      setError(err.response?.data?.error || "Failed to fetch assigned enquiries. Please try again.");
    }
  };

  const onContactStatusSubmit = async (data) => {
    try {
      setError(null);
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/contacts/enquiries/${selectedEnquiry.id}/`,
        {
          contact_status: data.status,
          note: data.note || null,
          reached_out_whatsapp: data.reachedOutWhatsApp || false,
          reached_out_email: data.reachedOutEmail || false,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setEnquiries(prev =>
        prev.map(e =>
          e.id === selectedEnquiry.id ? { ...e, ...response.data } : e
        )
      );
      setIsContactStatusOpen(false);
      contactStatusForm.reset();
    } catch (err) {
      const errorMessage = err.response?.data
        ? Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join("; ")
        : err.message || "Failed to update contact status.";
      setError(errorMessage);
    }
  };

  const onScheduleSurveySubmit = async (data) => {
    try {
      setError(null);
      const response = await axios.post(
        `http://127.0.0.1:8000/api/contacts/enquiries/${selectedEnquiry.id}/schedule/`,
        { survey_date: data.surveyDate },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setEnquiries(prev =>
        prev.map(e =>
          e.id === selectedEnquiry.id ? { ...e, survey_date: response.data.survey_date } : e
        )
      );
      setIsScheduleSurveyOpen(false);
      scheduleSurveyForm.reset();
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to schedule survey.";
      setError(errorMessage);
    }
  };

  const onCancelSurveySubmit = async (data) => {
    try {
      setError(null);
      const response = await axios.post(
        `http://127.0.0.1:8000/api/contacts/enquiries/${selectedEnquiry.id}/cancel-survey/`,
        { reason: data.reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setEnquiries(prev =>
        prev.map(e =>
          e.id === selectedEnquiry.id ? { ...e, survey_date: null } : e
        )
      );
      setIsCancelSurveyOpen(false);
      cancelSurveyForm.reset();
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to cancel survey.";
      setError(errorMessage);
    }
  };

  const openContactStatusModal = (enquiry, status) => {
    setSelectedEnquiry({ ...enquiry, status });
    contactStatusForm.reset({
      status,
      note: enquiry.note || "",
      reachedOutWhatsApp: enquiry.reached_out_whatsapp || false,
      reachedOutEmail: enquiry.reached_out_email || false,
    });
    setIsContactStatusOpen(true);
  };

  const openScheduleSurveyModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    scheduleSurveyForm.reset();
    setIsScheduleSurveyOpen(true);
  };

  const openCancelSurveyModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    cancelSurveyForm.reset();
    setIsCancelSurveyOpen(true);
  };

  const openPhoneModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsPhoneModalOpen(true);
  };

  if (!user || !user.permissions.includes("dashboard")) {
    return <div className="text-[#2d4a5e] text-center">Access denied. You need the 'dashboard' permission to view assigned enquiries.</div>;
  }

  return (
    <div className="container mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {enquiries.length === 0 ? (
        <div className="text-center text-[#2d4a5e] text-sm sm:text-base p-5 bg-white shadow-sm rounded-lg">
          No Assigned Enquiries Found
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
                <p className="flex items-center gap-2">
                  <strong>Survey Date:</strong>
                  <span className="flex items-center gap-2">
                    <FaCalendarAlt className="w-4 h-4 text-[#4c7085]" />
                    {enquiry.survey_date ? new Date(enquiry.survey_date).toLocaleString() : "Not Scheduled"}
                  </span>
                </p>
                <p>
                  <strong>Contact Status:</strong>
                  <select
                    className="p-2 border rounded text-[#2d4a5e] text-sm sm:text-base mt-2"
                    onChange={e => openContactStatusModal(enquiry, e.target.value)}
                    value={enquiry.contact_status || "Not Attended"}
                  >
                    <option value="Not Attended">Not Attended</option>
                    <option value="Attended">Attended</option>
                  </select>
                </p>
                <div className="flex flex-wrap gap-2 pt-3">
                  {!enquiry.survey_date ? (
                    <button
                      onClick={() => openScheduleSurveyModal(enquiry)}
                      className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-sm py-2 px-3 rounded"
                    >
                      Schedule Survey
                    </button>
                  ) : (
                    <button
                      onClick={() => openCancelSurveyModal(enquiry)}
                      className="bg-red-500 text-white text-sm py-2 px-3 rounded"
                    >
                      Cancel Survey
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {/* Contact Status Modal */}
      <Modal
        isOpen={isContactStatusOpen}
        onClose={() => setIsContactStatusOpen(false)}
        title="Update Contact Status"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsContactStatusOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="contact-status-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded"
            >
              Update Status
            </button>
          </>
        }
      >
        <FormProvider {...contactStatusForm}>
          <form
            id="contact-status-form"
            onSubmit={contactStatusForm.handleSubmit(onContactStatusSubmit)}
            className="space-y-4"
          >
            <Input
              label="Contact Status"
              name="status"
              type="select"
              options={[
                { value: "Attended", label: "Attended" },
                { value: "Not Attended", label: "Not Attended" },
              ]}
              rules={{ required: "Status is required" }}
            />
            <Input
              label="Note (Optional)"
              name="note"
              type="textarea"
            />
            {selectedEnquiry?.status === "Not Attended" && (
              <>
                <div className="mb-4">
                  <label className="flex items-center text-[#2d4a5e] text-sm sm:text-base font-medium">
                    <input
                      type="checkbox"
                      {...contactStatusForm.register("reachedOutWhatsApp")}
                      className="mr-2 w-5 h-5"
                    />
                    Reached out via WhatsApp
                  </label>
                </div>
                <div className="mb-4">
                  <label className="flex items-center text-[#2d4a5e] text-sm sm:text-base font-medium">
                    <input
                      type="checkbox"
                      {...contactStatusForm.register("reachedOutEmail")}
                      className="mr-2 w-5 h-5"
                    />
                    Reached out via Email
                  </label>
                </div>
              </>
            )}
          </form>
        </FormProvider>
      </Modal>
      {/* Schedule Survey Modal */}
      <Modal
        isOpen={isScheduleSurveyOpen}
        onClose={() => setIsScheduleSurveyOpen(false)}
        title="Schedule Survey"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsScheduleSurveyOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="schedule-survey-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded"
            >
              Schedule
            </button>
          </>
        }
      >
        <FormProvider {...scheduleSurveyForm}>
          <form
            id="schedule-survey-form"
            onSubmit={scheduleSurveyForm.handleSubmit(onScheduleSurveySubmit)}
            className="space-y-4"
          >
            <Input
              label="Survey Date"
              name="surveyDate"
              type="select"
              options={surveySlots}
              rules={{ required: "Survey Date is required" }}
            />
          </form>
        </FormProvider>
      </Modal>
      {/* Cancel Survey Modal */}
      <Modal
        isOpen={isCancelSurveyOpen}
        onClose={() => setIsCancelSurveyOpen(false)}
        title="Cancel Survey"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsCancelSurveyOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="cancel-survey-form"
              className="bg-red-500 text-white py-2 px-4 rounded"
            >
              Cancel Survey
            </button>
          </>
        }
      >
        <FormProvider {...cancelSurveyForm}>
          <form
            id="cancel-survey-form"
            onSubmit={cancelSurveyForm.handleSubmit(onCancelSurveySubmit)}
            className="space-y-4"
          >
            <Input
              label="Reason for Cancellation"
              name="reason"
              type="textarea"
              rules={{ required: "Reason is required" }}
            />
          </form>
        </FormProvider>
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

export default NewEnquiries;