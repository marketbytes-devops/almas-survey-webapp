import { useState, useEffect } from "react";
import { NavLink } from "react-router";
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

const ScheduledSurveys = () => {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [error, setError] = useState(null);
  const [isRescheduleSurveyOpen, setIsRescheduleSurveyOpen] = useState(false);
  const [isCancelSurveyOpen, setIsCancelSurveyOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const rescheduleSurveyForm = useForm();
  const cancelSurveyForm = useForm();

  const surveySlots = [
    { value: "2025-08-20 09:00", label: "2025-08-20 09:00 AM" },
    { value: "2025-08-20 14:00", label: "2025-08-20 02:00 PM" },
    { value: "2025-08-21 10:00", label: "2025-08-21 10:00 AM" },
  ];

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setError(null);
      const response = await axios.get("http://127.0.0.1:8000/api/contacts/enquiries/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { has_survey: 'true' }
      });
      setEnquiries(response.data);
    } catch (err) {
      console.error("Failed to fetch enquiries", err);
      setError(err.response?.data?.detail || formatError(err.response?.data) || "Failed to fetch enquiries. Please try again.");
    }
  };

  const formatError = (errorData) => {
    if (!errorData) return null;
    return Object.entries(errorData)
      .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
      .join("; ");
  };

  const onRescheduleSurveySubmit = async (data) => {
    try {
      setError(null);
      await axios.post(
        `http://127.0.0.1:8000/api/contacts/enquiries/${selectedEnquiry.id}/schedule/`,
        { survey_date: data.surveyDate },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchEnquiries();
      setIsRescheduleSurveyOpen(false);
      rescheduleSurveyForm.reset();
    } catch (err) {
      console.error("Failed to reschedule survey", err);
      setError(err.response?.data?.detail || formatError(err.response?.data) || "Failed to reschedule survey. Please try again.");
    }
  };

  const onCancelSurveySubmit = async (data) => {
    try {
      setError(null);
      await axios.post(
        `http://127.0.0.1:8000/api/contacts/enquiries/${selectedEnquiry.id}/cancel-survey/`,
        { reason: data.reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchEnquiries();
      setIsCancelSurveyOpen(false);
      cancelSurveyForm.reset();
    } catch (err) {
      console.error("Failed to cancel survey", err);
      setError(err.response?.data?.detail || formatError(err.response?.data) || "Failed to cancel survey. Please try again.");
    }
  };

  const openRescheduleSurveyModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    rescheduleSurveyForm.reset({ surveyDate: enquiry.survey_date });
    setIsRescheduleSurveyOpen(true);
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

  return (
    <div className="container mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
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
                <p><strong>Survey Date & Time:</strong> {new Date(enquiry.survey_date).toLocaleString()}</p>
                <p><strong>Customer Name:</strong> {enquiry.fullName}</p>
                <p className="flex items-center gap-2">
                  <strong>Phone:</strong>
                  <button
                    onClick={() => openPhoneModal(enquiry)}
                    className="flex items-center justify-center gap-2 text-[#4c7085] hover:text-[#2d4a5e]"
                    aria-label="Contact via phone or WhatsApp"
                  >
                    <FaPhoneAlt className="w-3 h-3" /> {enquiry.phoneNumber}
                  </button>
                </p>
                <p className="flex items-center gap-2">
                  <strong>Email:</strong>
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="flex items-center justify-center gap-2 text-[#4c7085] hover:text-[#2d4a5e]"
                    aria-label="Email customer"
                  >
                    <FaEnvelope className="w-3 h-3" /> {enquiry.email}
                  </a>
                </p>
                <p><strong>Service:</strong> {enquiry.serviceType}</p>
                <p><strong>Message:</strong> {enquiry.message}</p>
                <p><strong>Note:</strong> {enquiry.note || "-"}</p>
                <div className="flex flex-wrap gap-2 pt-3">
                  <motion.button
                    onClick={() => openRescheduleSurveyModal(enquiry)}
                    className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-sm py-2 px-3 rounded hover:bg-[#4c7085]"
                    whileTap={{ scale: 0.95 }}
                    aria-label="Reschedule survey"
                  >
                    Re-Schedule
                  </motion.button>
                  <motion.button
                    onClick={() => openCancelSurveyModal(enquiry)}
                    className="bg-red-500 text-white text-sm py-2 px-3 rounded hover:bg-red-600"
                    whileTap={{ scale: 0.95 }}
                    aria-label="Cancel survey"
                  >
                    Cancel
                  </motion.button>
                  <NavLink
                    to="/survey-form"
                    className="bg-gray-500 text-white text-sm py-2 px-3 rounded hover:bg-gray-600 text-center"
                    aria-label="Start survey"
                  >
                    Start Survey
                  </NavLink>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <Modal
        isOpen={isRescheduleSurveyOpen}
        onClose={() => setIsRescheduleSurveyOpen(false)}
        title="Re-Schedule Survey"
        footer={
          <>
            <motion.button
              type="button"
              onClick={() => setIsRescheduleSurveyOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 text-sm sm:text-base"
              whileTap={{ scale: 0.95 }}
              aria-label="Cancel reschedule"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              form="reschedule-survey-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085] text-sm sm:text-base"
              whileTap={{ scale: 0.95 }}
              aria-label="Confirm reschedule"
            >
              Re-Schedule
            </motion.button>
          </>
        }
      >
        <FormProvider {...rescheduleSurveyForm}>
          <form
            id="reschedule-survey-form"
            onSubmit={rescheduleSurveyForm.handleSubmit(onRescheduleSurveySubmit)}
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
      <Modal
        isOpen={isCancelSurveyOpen}
        onClose={() => setIsCancelSurveyOpen(false)}
        title="Cancel Survey"
        footer={
          <>
            <motion.button
              type="button"
              onClick={() => setIsCancelSurveyOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 text-sm sm:text-base"
              whileTap={{ scale: 0.95 }}
              aria-label="Cancel"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              form="cancel-survey-form"
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 text-sm sm:text-base"
              whileTap={{ scale: 0.95 }}
              aria-label="Confirm cancel"
            >
              Confirm Cancel
            </motion.button>
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
              rules={{ required: "Reason for cancellation is required" }}
            />
          </form>
        </FormProvider>
      </Modal>
      <Modal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        title="Contact Options"
        footer={
          <>
            <motion.button
              type="button"
              onClick={() => setIsPhoneModalOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 text-sm sm:text-base"
              whileTap={{ scale: 0.95 }}
              aria-label="Cancel"
            >
              Cancel
            </motion.button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-[#2d4a5e] text-sm sm:text-base">
            Choose how to contact {selectedEnquiry?.fullName}:
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`tel:${selectedEnquiry?.phoneNumber}`}
              className="flex items-center gap-2 bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085] text-sm sm:text-base"
            >
              <FaPhoneAlt className="w-5 h-5" />
              Call
            </a>
            <a
              href={`https://wa.me/${selectedEnquiry?.phoneNumber}`}
              className="flex items-center gap-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-sm sm:text-base"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="w-5 h-5" />
              WhatsApp
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ScheduledSurveys;