import { useState } from "react";
import { motion } from "framer-motion";
import { FormProvider, useForm } from "react-hook-form";
import Modal from "../../components/Modal";
import Input from "../../components/Input";

const rowVariants = {
  hover: { backgroundColor: "#f3f4f6", scale: 1.02 },
  rest: { backgroundColor: "#ffffff", scale: 1 },
};

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([
    {
      id: 1,
      date: "2025-08-18 10:00",
      customerName: "John Doe",
      phone: "123-456-7890",
      email: "john@example.com",
      service: "Survey Consultation",
      message: "Interested in property survey.",
      assigned: false,
    },
    {
      id: 2,
      date: "2025-08-17 14:30",
      customerName: "Jane Smith",
      phone: "987-654-3210",
      email: "jane@example.com",
      service: "Land Assessment",
      message: "Need assessment for new site.",
      assigned: false,
    },
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const addForm = useForm();
  const editForm = useForm();
  const assignForm = useForm();

  const salespersons = [
    { value: "john_doe", label: "John Doe" },
    { value: "jane_smith", label: "Jane Smith" },
    { value: "bob_jones", label: "Bob Jones" },
  ];

  const onAddSubmit = (data) => {
    const newEnquiry = {
      id: enquiries.length + 1,
      date: new Date().toLocaleString(),
      ...data,
      assigned: false,
    };
    setEnquiries([...enquiries, newEnquiry]);
    setIsAddOpen(false);
    addForm.reset();
  };

  const onEditSubmit = (data) => {
    setEnquiries(
      enquiries.map((enquiry) =>
        enquiry.id === selectedEnquiry.id ? { ...enquiry, ...data } : enquiry
      )
    );
    setIsEditOpen(false);
    editForm.reset();
  };

  const onAssignSubmit = (data) => {
    setEnquiries(
      enquiries.map((enquiry) =>
        enquiry.id === selectedEnquiry.id
          ? { ...enquiry, assigned: true, salesperson: data.salesperson, note: data.note }
          : enquiry
      )
    );
    setIsAssignOpen(false);
    assignForm.reset();
  };

  const onDelete = () => {
    setEnquiries(enquiries.filter((enquiry) => enquiry.id !== selectedEnquiry.id));
    setIsDeleteOpen(false);
  };

  const openEditModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    editForm.reset(enquiry);
    setIsEditOpen(true);
  };

  const openAssignModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    assignForm.reset();
    setIsAssignOpen(true);
  };

  const openDeleteModal = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsDeleteOpen(true);
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold text-[#2d4a5e] mb-6">
        New Enquiries
      </h1>
      <div className="mb-4">
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-sm font-medium py-2 px-4 rounded hover:bg-[#4c7085]"
        >
          Add New Enquiry
        </button>
      </div>
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
              <th className="p-2 text-left whitespace-nowrap">Message</th>
              <th className="p-2 text-left whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enquiries
              .filter((enquiry) => !enquiry.assigned)
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
                  <td className="p-2 text-[#2d4a5e] whitespace-nowrap">{enquiry.phone}</td>
                  <td className="p-2 text-[#2d4a5e] whitespace-nowrap">{enquiry.email}</td>
                  <td className="p-2 text-[#2d4a5e] whitespace-nowrap">{enquiry.service}</td>
                  <td className="p-2 text-[#2d4a5e] whitespace-nowrap">{enquiry.message}</td>
                  <td className="p-2 flex space-x-2">
                    <button
                      onClick={() => openAssignModal(enquiry)}
                      className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-xs py-1 px-2 rounded hover:bg-[#4c7085]"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => openEditModal(enquiry)}
                      className="bg-gray-500 text-white text-xs py-1 px-2 rounded hover:bg-gray-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(enquiry)}
                      className="bg-red-500 text-white text-xs py-1 px-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>

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
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-enquiry-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              Add Enquiry
            </button>
          </>
        }
      >
        <FormProvider {...addForm}>
          <form id="add-enquiry-form" onSubmit={addForm.handleSubmit(onAddSubmit)}>
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
              type="text"
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
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-enquiry-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              Update Enquiry
            </button>
          </>
        }
      >
        <FormProvider {...editForm}>
          <form id="edit-enquiry-form" onSubmit={editForm.handleSubmit(onEditSubmit)}>
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
              type="text"
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

      {/* Assign Enquiry Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Assign Enquiry"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="assign-enquiry-form"
              className="bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              Assign
            </button>
          </>
        }
      >
        <FormProvider {...assignForm}>
          <form id="assign-enquiry-form" onSubmit={assignForm.handleSubmit(onAssignSubmit)}>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Enquiry"
        footer={
          <>
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-[#2d4a5e]">
          Are you sure you want to delete this enquiry?
        </p>
      </Modal>
    </div>
  );
};

export default Enquiries;