import { Outlet, useLocation } from "react-router";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const routeNames = {
  "/": "Dashboard",
  "/enquiries": "Enquiries",
  "/processing-enquries": "Processing Enquiries",
  "/follow-ups": "Follow Ups",
  "/scheduled-surveys": "Scheduled Surveys",
  "/new-enquiries": "New Enquiries",
  "/profile": "Additional Settings",
};

const Layout = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const location = useLocation();
  const activePage = routeNames[location.pathname] || "Dashboard";

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isOpen && <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />}
      <div className={`flex flex-col ${isOpen ? "flex-1" : "w-full"}`}>
        <Topbar toggleSidebar={toggleSidebar} isOpen={isOpen} activePage={activePage} />
        <main className={`flex-1 p-4 sm:p-6 ${isOpen ? "" : "w-full"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;