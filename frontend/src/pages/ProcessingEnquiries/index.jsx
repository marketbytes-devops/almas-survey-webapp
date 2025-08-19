import { useState } from "react";
import { motion } from "framer-motion";
import { FaPhoneAlt, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import Modal from "../../components/Modal";

const rowVariants = {
  hover: { backgroundColor: "#f3f4f6" },
  rest: { backgroundColor: "#ffffff" },
};

const ProcessingEnquiries = () => {
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
      contactStatus: "Attended",
    },
  ]);

  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const openPhoneModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsPhoneModalOpen(true);
  };

  return (
    <div className="container mx-auto">
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
              <p><strong>Contact Status:</strong> {enquiry.contactStatus}</p>
            </div>
          </motion.div>
        ))}
      </div>

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

export default ProcessingEnquiries;