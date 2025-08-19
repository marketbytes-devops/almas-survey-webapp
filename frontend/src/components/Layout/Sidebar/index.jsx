import { NavLink } from "react-router";
import { motion } from "framer-motion";
import logo from "../../../assets/images/logo.webp";
import { useAuth } from "../../../hooks/useAuth";

const sidebarVariants = {
  open: { x: 0 },
  closed: { x: "-100%" },
};

const overlayVariants = {
  open: { opacity: 0.5 },
  closed: { opacity: 0 },
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, loading } = useAuth();

  const allNavItems = [
    { to: "/", label: "Dashboard", permission: "dashboard" },
    { to: "/enquiries", label: "Enquiries", permission: "enquiries" },
    { to: "/processing-enquiries", label: "Processing Enquiries", permission: "processing-enquiries" },
    { to: "/follow-ups", label: "Follow Ups", permission: "follow-ups" },
    { to: "/scheduled-surveys", label: "Scheduled Surveys", permission: "scheduled-surveys" },
    { to: "/new-enquiries", label: "New Enquiries", permission: "new-enquiries" },
    { to: "/profile", label: "Additional Settings", permission: "profile" },
    { to: "/users", label: "Users", permission: "users" },
    { to: "/permissions", label: "Permissions", permission: "permissions" },
  ];

  const adminMandatoryPermissions = ["dashboard", "profile", "users", "permissions"];

  const navItems = user?.role === "admin"
    ? allNavItems.filter(item => adminMandatoryPermissions.includes(item.permission) || user.permissions.includes(item.permission))
    : allNavItems.filter(item => user?.permissions.includes(item.permission));

  // Sort navItems by label for consistent display
  navItems.sort((a, b) => a.label.localeCompare(b.label));

  if (loading) {
    return (
      <motion.div
        className="fixed inset-y-0 left-0 w-3/4 max-w-[20rem] bg-white shadow z-30 md:w-72"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-center mb-4">
            <img
              src={logo}
              alt="Almas Survey Logo"
              className="w-full h-12 sm:h-14 object-contain rounded"
            />
          </div>
          <p className="text-center text-[#2d4a5e] text-sm">Loading...</p>
        </div>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <motion.div
        className="fixed inset-y-0 left-0 w-3/4 max-w-[20rem] bg-white shadow z-30 md:w-72"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-center mb-4">
            <img
              src={logo}
              alt="Almas Survey Logo"
              className="w-full h-12 sm:h-14 object-contain rounded"
            />
          </div>
          <p className="text-center text-[#2d4a5e] text-sm">Please log in to access the dashboard.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className="fixed inset-y-0 left-0 w-3/4 max-w-[20rem] bg-white shadow z-30 md:w-72"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-center mb-4">
            <img
              src={logo}
              alt="Almas Survey Logo"
              className="w-full h-12 sm:h-14 object-contain rounded"
            />
          </div>
          <nav className="flex-grow">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded text-sm sm:text-base font-medium ${
                        isActive
                          ? "bg-gradient-to-r from-[#4c7085] to-[#6b8ca3] text-white"
                          : "text-[#2d4a5e] hover:bg-[#2d4a5e]/20 hover:text-[#2d4a5e]"
                      }`
                    }
                    onClick={() => {
                      if (window.innerWidth < 768) toggleSidebar();
                    }}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
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