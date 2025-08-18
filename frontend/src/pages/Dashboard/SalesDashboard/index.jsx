import { NavLink } from "react-router";
import { motion } from "framer-motion";

const cardVariants = {
  hover: { scale: 1.05, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)" },
  rest: { scale: 1, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
};

const SalesDashboard = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold text-[#2d4a5e] mb-6">
        Sales Dashboard
      </h1>
      <div className="mb-8">
        <h2 className="text-xl font-medium text-[#2d4a5e] mb-4">Quick Access</h2>
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
              View all newly assigned or unattended enquiries.
            </p>
            <NavLink
              to="/new-enquiries"
              className="mt-3 inline-block bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-sm font-medium py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              View 5 New Enquiries
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
              Pending/Processing Enquiries
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              View all pending and processing enquiries.
            </p>
            <NavLink
              to="/processing-enquries"
              className="mt-3 inline-block bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-sm font-medium py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              View 8 Pending/Processing
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
              View all scheduled surveys.
            </p>
            <NavLink
              to="/scheduled-surveys"
              className="mt-3 inline-block bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-sm font-medium py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              View 6 Scheduled
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
              View all non-scheduled enquiries.
            </p>
            <NavLink
              to="/follow-ups"
              className="mt-3 inline-block bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white text-sm font-medium py-2 px-4 rounded hover:bg-[#4c7085]"
            >
              View 10 Follow Ups
            </NavLink>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;