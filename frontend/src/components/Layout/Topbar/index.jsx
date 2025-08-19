import { motion } from "framer-motion";
import { FaBars } from "react-icons/fa";

const Topbar = ({ toggleSidebar, isOpen, activePage }) => {
  return (
    <div className={`bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] shadow px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10 rounded-b-lg ${isOpen ? "md:mx-6" : "mx-6"}`}>
      <div className="flex items-center space-x-4">
        <motion.button
          className="text-white p-2 rounded-md hover:bg-[#2d4a5e]/20"
          onClick={toggleSidebar}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <FaBars className="w-4 h-4 sm:w-6 sm:h-6" />
          ) : (
            <FaBars className="w-4 h-4 sm:w-6 sm:h-6" />
          )}
        </motion.button>
        <span className="text-white text-sm sm:text-base font-light truncate max-w-[150px] sm:max-w-none">
          {activePage}
        </span>
      </div>
      <div className="flex space-x-4 sm:space-x-6">
        <span className="text-white text-sm sm:text-base hidden md:block">User Profile</span>
      </div>
    </div>
  );
};

export default Topbar;