import { motion } from "framer-motion";

const Topbar = ({ toggleSidebar, isOpen }) => {
  return (
    <div className={`bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] shadow p-4 flex items-center justify-between sticky top-0 z-10 rounded-t-none rounded-b-3xl ${isOpen ? "mx-10" : "w-full"}`}>
      <motion.button
        className="text-white"
        onClick={toggleSidebar}
        transition={{ duration: 0.3 }}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isOpen ? "M4 6h16M4 12h16m-7 6h7" : "M6 18L18 6M6 6l12 12"}
          />
        </svg>
      </motion.button>
      <div className="flex space-x-4">
        <span className="text-white hidden md:block">User Profile</span>
      </div>
    </div>
  );
};

export default Topbar;