import { useState } from "react";
import { motion } from "framer-motion";
import { FormProvider, useForm } from "react-hook-form";
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
    console.log(
      `Contact status updated for ${selectedEnquiry.customerName}:`,
      data
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
    console.log(
      `Survey scheduled for ${selectedEnquiry.customerName} to ${data.surveyDate}`,
      { emailTo: [selectedEnquiry.email, selectedEnquiry.salesperson] }
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

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold text-[#2d4a5e] mb-6">
        New Enquiries
      </h1>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#4c7085] text-white text-sm">
              <th className="p-2 text-left whitespace-nowrap">Sl No</th>
              <th className="p-2 text-left whitespace-nowrap">Date & Time</th>
              <th className="p-2 text-left whitespace-nowrap">Customer Name</th>
              <th className="p-2 text-left whitespace-nowrap">Phone</th>
              <th className="p-2 text-left whitespace-nowrap">Email</th>
              <th className="p-2 text-left whitespace-nowrap">Service</th>
              <th className="p-2 text-left">Message</th>
              <th className="p-2 text-left">Note</th>
              <th className="p-2 text-left whitespace-nowrap">Contact Status</th>
              <th className="p-2 text-left whitespace-nowrap">Schedule Survey</th>
            </tr>
          </thead>
          <tbody>
            {enquiries
              .filter((enquiry) => enquiry.salesperson && !enquiry.survey)
              .map((enquiry, index) => (
                <motion.tr
                  key={enquiry.id}
                  className="border-b"
                  variants={rowVariants}
                  initial="rest"
                  whileHover="hover"
                  transition={{ duration: 0.2 }}
                >
                  <td className="p-2 text-[#2d4a5e] whitespace-nowrap">{index + 1}</td>
                  <td className="p-2 text-[#2d4a5e] whitespace-nowrap">{enquiry.date}</td>
                  <td className="p-2 text-[#2d4a5e] whitespace-nowrap">{enquiry.customerName}</td>
                  <td className="p-2 text-[#2d4a5e] whitespace-nowrap flex items-center space-x-2">
                    {enquiry.phone}
                    <a
                      href={`tel:${enquiry.phone}`}
                      className="text-[#4c7085] hover:text-[#2d4a5e]"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5h4l1 7h7l1-7h4m-11 7v6m4-6v6m-4-6h4"
                        />
                      </svg>
                    </a>
                    <a
                      href={`https://wa.me/${enquiry.phone}`}
                      className="text-[#4c7085] hover:text-[#2d4a5e]"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.174.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.074-.149-.669-.816-.916-1.115-.247-.297-.446-.223-.644-.223-.198 0-.396.05-.572.149-.177.099-1.126.372-1.324 1.387-.198 1.015.074 2.361.669 3.476.594 1.115 2.361 3.626 5.73 5.086.793.347 1.41.496 1.89.595.693.149 2.123.074 2.867-.842.446-.545.545-1.212.421-1.336-.124-.124-.297-.074-.446-.223zm-5.45 5.333c-2.024 0-4.023-.595-5.735-1.736l-.421.248-1.512.892.916-1.512-.248-.421c-1.141-1.909-1.736-4.122-1.736-6.395 0-6.642 5.407-12.049 12.049-12.049s12.049 5.407 12.049 12.049-5.407 12.049-12.049 12.049zm6.147-2.619c-.694.347-1.41.595-2.024.694-.793.149-1.61.099-2.471-.099-1.015-.248-2.024-.644-3.228-1.413-2.818-1.787-5.039-4.619-6.147-7.85-.992-2.867-.545-5.934 1.115-8.096.644-.842 1.512-1.413 2.52-1.512.099 0 .198 0 .297.025.793.099 1.214.545 1.512 1.413.297.892.347 1.837.099 2.669-.099.347-.248.694-.421.992-.173.297-.347.595-.223.892.099.248.297.496.446.744.446.595 1.015 1.115 1.736 1.512.099.05.198.099.297.149.099.05.198.099.297.099.099 0 .198-.025.297-.074.297-.149.595-.347.892-.644.297-.297.595-.694.744-1.115.099-.297.099-.595.099-.892 0-.297-.025-.595-.099-.892-.099-.347-.248-.694-.545-1.015-.297-.347-.644-.595-1.015-.694-.099-.025-.198-.025-.297-.025-.099 0-.198.025-.297.074-.793.347-1.413 1.015-1.512 1.909-.099.892.297 1.787.892 2.52.595.744 1.413 1.115 2.321 1.512 1.512.644 3.129.892 4.619.595.793-.149 1.512-.545 2.024-1.115.347-.396.595-.892.694-1.413.025-.099.025-.198.025-.297-.099-.099-.297-.099-.446-.099zm-6.147-18.667c-7.85 0-14.245 6.395-14.245 14.245s6.395 14.245 14.245 14.245 14.245-6.395 14.245-14.245-6.395-14.245-14.245-14.245z" />
                      </svg>
                    </a>
                  </td>
                  <td className="p-2 text-[#2d4a5e] whitespace-nowrap flex items-center space-x-2">
                    {enquiry.email}
                    <a
                      href={`mailto:${enquiry.email}`}
                      className="text-[#4c7085] hover:text-[#2d4a5e]"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </a>
                  </td>
                  <td className="p-2 text-[#2d4a5e] whitespace-nowrap">{enquiry.service}</td>
                  <td className="p-2 text-[#2d4a5e]">{enquiry.message}</td>
                  <td className="p-2 text-[#2d4a5e]">{enquiry.note || "-"}</td>
                  <td className="p-2 text-[#2d4a5e] whitespace-nowrap">
                    <select
                      className="p-1 border rounded text-[#2d4a5e]"
                      onChange={(e) => openContactStatusModal(enquiry, e.target.value)}
                      value={enquiry.contactStatus}
                    >
                      <option value="Not Attended">Not Attended</option>
                      <option value="Attended">Attended</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => openScheduleSurveyModal(enquiry)}
                      className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-xs py-1 px-2 rounded hover:bg-[#4c7085]"
                    >
                      Schedule
                    </button>
                  </td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>

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
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="contact-status-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085]"
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
                  <label className="flex items-center text-[#2d4a5e] text-sm font-medium">
                    <input
                      type="checkbox"
                      {...contactStatusForm.register("reachedOutWhatsApp")}
                      className="mr-2"
                    />
                    Reached out via WhatsApp
                  </label>
                </div>
                <div className="mb-4">
                  <label className="flex items-center text-[#2d4a5e] text-sm font-medium">
                    <input
                      type="checkbox"
                      {...contactStatusForm.register("reachedOutEmail")}
                      className="mr-2"
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
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="schedule-survey-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085]"
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
    </div>
  );
};

export default NewEnquiries;