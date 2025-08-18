import { NavLink } from "react-router";
import { motion } from "framer-motion";

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
          <nav className="mt-6 flex-grow">
            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `block p-2 rounded ${isActive
                      ? "bg-[#4c7085] text-white"
                      : "text-[#2d4a5e] hover:bg-none hover:text-[#2d4a5e]"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/inquiries"
                  className={({ isActive }) =>
                    `block p-2 rounded ${isActive
                      ? "bg-[#4c7085] text-white"
                      : "text-[#2d4a5e] hover:bg-none hover:text-[#2d4a5e]"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  Inquiries
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `block p-2 rounded ${isActive
                      ? "bg-[#4c7085] text-white"
                      : "text-[#2d4a5e] hover:bg-none hover:text-[#2d4a5e]"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  Contact
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/thank-you"
                  className={({ isActive }) =>
                    `block p-2 rounded ${isActive
                      ? "bg-[#4c7085] text-white"
                      : "text-[#2d4a5e] hover:bg-none hover:text-[#2d4a5e]"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  Thank You
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