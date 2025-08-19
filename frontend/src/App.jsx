import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./components/Layout";
import SalesDashboard from "./pages/Dashboard/SalesDashboard";
import Enquiries from "./pages/Enquiries";
import ProcessingEnquiries from "./pages/ProcessingEnquiries";
import FollowUps from "./pages/FollowUps";
import ScheduledSurveys from "./pages/ScheduledSurveys";
import NewEnquiries from "./pages/NewEnquiries";
import Profile from "./pages/AdditionalSettings/Profile";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: SalesDashboard },
      { path: "/enquiries", Component: Enquiries },
      { path: "/processing-enquries", Component: ProcessingEnquiries },
      { path: "/follow-ups", Component: FollowUps },
      { path: "/scheduled-surveys", Component: ScheduledSurveys },

      // sales
      { path: "/new-enquiries", Component: NewEnquiries },

      // additional settings
      { path: "/profile", Component: Profile },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;