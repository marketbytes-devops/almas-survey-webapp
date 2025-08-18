import { NavLink } from "react-router";
import { motion } from "framer-motion";
import logo from "../../../assets/images/logo.webp";

const sidebarVariants = {
  open: { x: 0 },
  closed: { x: "-100%" },
};

const overlayVariants = {
  open: { opacity: 0.5 },
  closed: { opacity: 0 },
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      <motion.div
        className="fixed inset-y-0 left-0 w-72 bg-white shadow z-30 md:relative"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Almas Survey Logo" className="w-full h-auto rounded" />
          </div>
          <nav className="flex-grow">
            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `block p-2 rounded ${isActive
                      ? "bg-[#4c7085] text-white font-medium text-sm"
                      : "text-[#2d4a5e] hover:bg-none hover:text-[#2d4a5e] font-medium text-sm"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/enquiries"
                  className={({ isActive }) =>
                    `block p-2 rounded ${isActive
                      ? "bg-[#4c7085] text-white font-medium text-sm"
                      : "text-[#2d4a5e] hover:bg-none hover:text-[#2d4a5e] font-medium text-sm"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  Enquiries
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/processing-enquries"
                  className={({ isActive }) =>
                    `block p-2 rounded ${isActive
                      ? "bg-[#4c7085] text-white font-medium text-sm"
                      : "text-[#2d4a5e] hover:bg-none hover:text-[#2d4a5e] font-medium text-sm"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  Processing Enquiries
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/follow-ups"
                  className={({ isActive }) =>
                    `block p-2 rounded ${isActive
                      ? "bg-[#4c7085] text-white font-medium text-sm"
                      : "text-[#2d4a5e] hover:bg-none hover:text-[#2d4a5e] font-medium text-sm"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  Follow Ups
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/scheduled-surveys"
                  className={({ isActive }) =>
                    `block p-2 rounded ${isActive
                      ? "bg-[#4c7085] text-white font-medium text-sm"
                      : "text-[#2d4a5e] hover:bg-none hover:text-[#2d4a5e] font-medium text-sm"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  Scheduled Surveys
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </motion.div>
      {isOpen && (
        <motion.div
          className="fixed inset-0 backdrop-brightness-50 z-20 md:hidden"
          onClick={toggleSidebar}
          initial="closed"
          animate="open"
          exit="closed"
          variants={overlayVariants}
          transition={{ duration: 0.3 }}
        />
      )}
    </>
  );
};

export default Sidebar;