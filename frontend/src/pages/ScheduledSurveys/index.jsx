import { useState } from "react";
import { NavLink } from "react-router";
import { motion } from "framer-motion";
import { FormProvider, useForm } from "react-hook-form";
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

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold text-[#2d4a5e] mb-6">
        Scheduled Surveys
      </h1>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#4c7085] text-white text-sm">
              <th className="p-2 text-left">Sl No</th>
              <th className="p-2 text-left">Survey Date & Time</th>
              <th className="p-2 text-left">Customer Name</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Service</th>
              <th className="p-2 text-left">Message</th>
              <th className="p-2 text-left">Note</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enquiries
              .filter((enquiry) => enquiry.survey)
              .map((enquiry, index) => (
                <motion.tr
                  key={enquiry.id}
                  className="border-b"
                  variants={rowVariants}
                  initial="rest"
                  whileHover="hover"
                  transition={{ duration: 0.2 }}
                >
                  <td className="p-2 text-[#2d4a5e]">{index + 1}</td>
                  <td className="p-2 text-[#2d4a5e]">{enquiry.survey.date}</td>
                  <td className="p-2 text-[#2d4a5e]">{enquiry.customerName}</td>
                  <td className="p-2 text-[#2d4a5e]">{enquiry.phone}</td>
                  <td className="p-2 text-[#2d4a5e]">{enquiry.email}</td>
                  <td className="p-2 text-[#2d4a5e]">{enquiry.service}</td>
                  <td className="p-2 text-[#2d4a5e]">{enquiry.message}</td>
                  <td className="p-2 text-[#2d4a5e]">{enquiry.note || "-"}</td>
                  <td className="p-2 flex space-x-2">
                    <button
                      onClick={() => openRescheduleSurveyModal(enquiry)}
                      className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-xs py-1 px-2 rounded hover:bg-[#4c7085]"
                    >
                      Re-Schedule
                    </button>
                    <button
                      onClick={() => openCancelSurveyModal(enquiry)}
                      className="bg-red-500 text-white text-xs py-1 px-2 rounded hover:bg-red-600"
                    >
                      Cancel
                    </button>
                    <NavLink
                      to="/survey-form"
                      className="bg-gray-500 text-white text-xs py-1 px-2 rounded hover:bg-gray-600"
                    >
                      Start Survey
                    </NavLink>
                  </td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Re-Schedule Survey Modal */}
      <Modal
        isOpen={isRescheduleSurveyOpen}
        onClose={() => setIsRescheduleSurveyOpen(false)}
        title="Re-Schedule Survey"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsRescheduleSurveyOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="reschedule-survey-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              Re-Schedule
            </button>
          </>
        }
      >
        <FormProvider {...rescheduleSurveyForm}>
          <form
            id="reschedule-survey-form"
            onSubmit={rescheduleSurveyForm.handleSubmit(onRescheduleSurveySubmit)}
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
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="cancel-survey-form"
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
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
    </div>
  );
};

export default ScheduledSurveys;