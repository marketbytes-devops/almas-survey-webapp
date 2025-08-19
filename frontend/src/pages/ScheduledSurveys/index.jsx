import { useState } from "react";
import { NavLink } from "react-router";
import { motion } from "framer-motion";
import { FormProvider, useForm } from "react-hook-form";
import { FaPhoneAlt, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import Modal from "../../components/Modal";
import Input from "../../components/Input";

const rowVariants = {
  hover: { backgroundColor: "#f3f4f6" },
  rest: { backgroundColor: "#ffffff" },
};

const ScheduledSurveys = () => {
  const [enquiries, setEnquiries] = useState([
    {
      id: 1,
      date: "2025-08-18 10:00",
      customerName: "John Doe",
      phone: "123-456-7890",
      email: "john@example.com",
      service: "Survey Consultation",
      message: "Interested in property survey.",
      note: "Urgent request",
      salesperson: "john_doe",
      contactStatus: "Not Attended",
      survey: null,
    },
    {
      id: 2,
      date: "2025-08-17 14:30",
      customerName: "Jane Smith",
      phone: "987-654-3210",
      email: "jane@example.com",
      service: "Land Assessment",
      message: "Need assessment for new site.",
      note: "Follow up required",
      salesperson: "jane_smith",
      contactStatus: "Not Attended",
      survey: { date: "2025-08-20 09:00" },
    },
  ]);

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

  const onRescheduleSurveySubmit = (data) => {
    setEnquiries(
      enquiries.map((enquiry) =>
        enquiry.id === selectedEnquiry.id
          ? { ...enquiry, survey: { date: data.surveyDate } }
          : enquiry
      )
    );
    console.log(
      `Survey rescheduled for ${selectedEnquiry.customerName} to ${data.surveyDate}`,
      { emailTo: [selectedEnquiry.email, selectedEnquiry.salesperson] }
    );
    setIsRescheduleSurveyOpen(false);
    rescheduleSurveyForm.reset();
  };

  const onCancelSurveySubmit = (data) => {
    setEnquiries(
      enquiries.map((enquiry) =>
        enquiry.id === selectedEnquiry.id
          ? { ...enquiry, survey: null }
          : enquiry
      )
    );
    console.log(
      `Survey cancelled for ${selectedEnquiry.customerName}. Reason: ${data.reason}`,
      {
        emailTo: [
          selectedEnquiry.email,
          selectedEnquiry.salesperson,
          "admin@example.com",
        ],
      }
    );
    setIsCancelSurveyOpen(false);
    cancelSurveyForm.reset();
  };

  const openRescheduleSurveyModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    rescheduleSurveyForm.reset({ surveyDate: enquiry.survey?.date });
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
      <div className="space-y-4">
        {enquiries
          .filter((enquiry) => enquiry.survey)
          .map((enquiry, index) => (
            <motion.div
              key={enquiry.id}
              className="rounded-lg p-5 bg-white shadow-sm"
              variants={rowVariants}
              initial="rest"
              whileHover="hover"
            >
              <div className="space-y-2 text-[#2d4a5e] text-sm sm:text-base">
                <p><strong>Sl No:</strong> {index + 1}</p>
                <p><strong>Survey Date & Time:</strong> {enquiry.survey.date}</p>
                <p><strong>Customer Name:</strong> {enquiry.customerName}</p>
                <p className="flex items-center gap-2">
                  <strong>Phone:</strong> {enquiry.phone}
                  <button
                    onClick={() => openPhoneModal(enquiry)}
                    className="flex items-center justify-center gap-2 text-[#4c7085] hover:text-[#2d4a5e]"
                    aria-label="Contact via phone or WhatsApp"
                  >
                    <FaPhoneAlt className="w-3 h-3" /> {enquiry.phone}
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
                <p><strong>Service:</strong> {enquiry.service}</p>
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
              aria-label="Cancel cancellation"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              form="cancel-survey-form"
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 text-sm sm:text-base"
              whileTap={{ scale: 0.95 }}
              aria-label="Confirm cancellation"
            >
              Cancel Survey
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
              rules={{ required: "Reason is required" }}
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
            Choose how to contact {selectedEnquiry?.customerName}:
          </p>
          <div className="flex flex-col gap-3">
            <a
              href={`tel:${selectedEnquiry?.phone}`}
              className="flex items-center gap-2 bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085] text-sm sm:text-base"
            >
              <FaPhoneAlt className="w-5 h-5" />
              Call
            </a>
            <a
              href={`https://wa.me/${selectedEnquiry?.phone}`}
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