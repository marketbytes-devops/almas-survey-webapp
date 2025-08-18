import { NavLink } from "react-router";
import { motion } from "framer-motion";

const cardVariants = {
  hover: { scale: 1.05, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)" },
  rest: { scale: 1, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
};

const AdminDashboard = () => {
  return (
    <div className="container mx-auto">
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            className="bg-white shadow rounded-lg p-4"
            variants={cardVariants}
            initial="rest"
            whileHover="hover"
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-medium text-[#2d4a5e]">
              New Enquiries
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              View all new enquiries submitted to the system.
            </p>
            <NavLink
              to="/enquiries"
              className="w-full mt-3 inline-block bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-sm font-medium py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              View 10 New Enquiries
            </NavLink>
          </motion.div>
          <motion.div
            className="bg-white shadow rounded-lg p-4"
            variants={cardVariants}
            initial="rest"
            whileHover="hover"
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-medium text-[#2d4a5e]">
              Not Assigned Enquiries
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Enquiries not yet assigned to a salesman.
            </p>
            <NavLink
              to="/enquiries"
              className="w-full mt-3 inline-block bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-sm font-medium py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              View 5 Not Assigned
            </NavLink>
          </motion.div>
          <motion.div
            className="bg-white shadow rounded-lg p-4"
            variants={cardVariants}
            initial="rest"
            whileHover="hover"
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-medium text-[#2d4a5e]">
              Processing Enquiries
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Enquiries assigned to salesmen and under processing.
            </p>
            <NavLink
              to="/processing-enquries"
              className="w-full mt-3 inline-block bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-sm font-medium py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              View 8 Processing
            </NavLink>
          </motion.div>
          <motion.div
            className="bg-white shadow rounded-lg p-4"
            variants={cardVariants}
            initial="rest"
            whileHover="hover"
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-medium text-[#2d4a5e]">
              Follow Ups
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              List all non-scheduled enquiries for all employees.
            </p>
            <NavLink
              to="/follow-ups"
              className="w-full mt-3 inline-block bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-sm font-medium py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              View 12 Follow Ups
            </NavLink>
          </motion.div>
          <motion.div
            className="bg-white shadow rounded-lg p-4"
            variants={cardVariants}
            initial="rest"
            whileHover="hover"
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-medium text-[#2d4a5e]">
              Scheduled Surveys
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              List all scheduled surveys for all employees.
            </p>
            <NavLink
              to="/scheduled-surveys"
              className="w-full mt-3 inline-block bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-sm font-medium py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              View 6 Scheduled
            </NavLink>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;