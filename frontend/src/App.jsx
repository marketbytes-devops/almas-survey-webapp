import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Layout from "./components/Layout";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import Enquiries from "./pages/Enquiries";
import ProcessingEnquiries from "./pages/ProcessingEnquiries";
import FollowUps from "./pages/FollowUps";
import ScheduledSurveys from "./pages/ScheduledSurveys";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "/enquiries", Component: Enquiries },
      { path: "/processing-enquries", Component: ProcessingEnquiries },
      { path: "/follow-ups", Component: FollowUps },
      { path: "/scheduled-surveys", Component: ScheduledSurveys },
    ]
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App