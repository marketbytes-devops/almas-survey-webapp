import { motion } from "framer-motion";

const Topbar = ({ toggleSidebar, isOpen, activePage }) => {
  return (
    <div className={`bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] shadow px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10 rounded-t-none rounded-b ${isOpen ? "mx-6" : "w-full"}`}>
      <div className="flex items-center space-x-3 sm:space-x-4">
        <motion.button
          className="text-white"
          onClick={toggleSidebar}
          transition={{ duration: 0.3 }}
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isOpen ? "M4 6h16M4 12h16m-7 6h7" : "M4 6h16M4 12h16m-7 6h7"}
            />
          </svg>
        </motion.button>
        <span className="text-white text-sm sm:text-base font-medium hidden md:block">
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