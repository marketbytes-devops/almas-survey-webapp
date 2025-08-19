import { useState } from "react";
import { motion } from "framer-motion";
import { FormProvider, useForm } from "react-hook-form";
import { FaPhoneAlt, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import Modal from "../../components/Modal";
import Input from "../../components/Input";

const rowVariants = {
  hover: { backgroundColor: "#f3f4f6" },
  rest: { backgroundColor: "#ffffff" },
};

const NewEnquiries = () => {
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

  const [isContactStatusOpen, setIsContactStatusOpen] = useState(false);
  const [isScheduleSurveyOpen, setIsScheduleSurveyOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const contactStatusForm = useForm();
  const scheduleSurveyForm = useForm();

  const surveySlots = [
    { value: "2025-08-20 09:00", label: "2025-08-20 09:00 AM" },
    { value: "2025-08-20 14:00", label: "2025-08-20 02:00 PM" },
    { value: "2025-08-21 10:00", label: "2025-08-21 10:00 AM" },
  ];

  const onContactStatusSubmit = (data) => {
    setEnquiries(
      enquiries.map((enquiry) =>
        enquiry.id === selectedEnquiry.id
          ? {
            ...enquiry,
            contactStatus: data.status,
            contactNote: data.note,
            reachedOutWhatsApp: data.reachedOutWhatsApp || false,
            reachedOutEmail: data.reachedOutEmail || false,
          }
          : enquiry
      )
    );
    setIsContactStatusOpen(false);
    contactStatusForm.reset();
  };

  const onScheduleSurveySubmit = (data) => {
    setEnquiries(
      enquiries.map((enquiry) =>
        enquiry.id === selectedEnquiry.id
          ? { ...enquiry, survey: { date: data.surveyDate } }
          : enquiry
      )
    );
    setIsScheduleSurveyOpen(false);
    scheduleSurveyForm.reset();
  };

  const openContactStatusModal = (enquiry, status) => {
    setSelectedEnquiry({ ...enquiry, status });
    contactStatusForm.reset({ status });
    setIsContactStatusOpen(true);
  };

  const openScheduleSurveyModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    scheduleSurveyForm.reset();
    setIsScheduleSurveyOpen(true);
  };

  const openPhoneModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsPhoneModalOpen(true);
  };

  return (
    <div className="container mx-auto">
      <div className="space-y-4">
        {enquiries
          .filter((enquiry) => enquiry.salesperson && !enquiry.survey)
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
                <p><strong>Date & Time:</strong> {enquiry.date}</p>
                <p><strong>Customer Name:</strong> {enquiry.customerName}</p>
                <p className="flex items-center gap-2">
                  <strong>Phone:</strong>
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
                <p>
                  <strong>Contact Status:</strong>
                  <select
                    className="p-2 border rounded text-[#2d4a5e] text-sm sm:text-base mt-2"
                    onChange={(e) => openContactStatusModal(enquiry, e.target.value)}
                    value={enquiry.contactStatus}
                  >
                    <option value="Not Attended">Not Attended</option>
                    <option value="Attended">Attended</option>
                  </select>
                </p>
                <div className="flex flex-wrap gap-2 pt-3">
                  <button
                    onClick={() => openScheduleSurveyModal(enquiry)}
                    className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-sm py-2 px-3 rounded hover:bg-[#4c7085]"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
      </div>

      <Modal
        isOpen={isContactStatusOpen}
        onClose={() => setIsContactStatusOpen(false)}
        title="Update Contact Status"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsContactStatusOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="contact-status-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085] text-sm sm:text-base"
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

      <Modal
        isOpen={isScheduleSurveyOpen}
        onClose={() => setIsScheduleSurveyOpen(false)}
        title="Schedule Survey"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsScheduleSurveyOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="schedule-survey-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085] text-sm sm:text-base"
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

export default NewEnquiries;