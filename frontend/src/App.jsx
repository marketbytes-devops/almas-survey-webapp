import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./components/Layout";
import SalesDashboard from "./pages/Dashboard/SalesDashboard";
import Enquiries from "./pages/Enquiries";
import ProcessingEnquiries from "./pages/ProcessingEnquiries";
import FollowUps from "./pages/FollowUps";
import ScheduledSurveys from "./pages/ScheduledSurveys";
import NewEnquiries from "./pages/NewEnquiries";
import Profile from "./pages/AdditionalSettings/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <SalesDashboard /> },
      { path: "/enquiries", element: <Enquiries /> },
      { path: "/processing-enquries", element: <ProcessingEnquiries /> },
      { path: "/follow-ups", element: <FollowUps /> },
      { path: "/scheduled-surveys", element: <ScheduledSurveys /> },

      // sales
      { path: "/new-enquiries", element: <NewEnquiries /> },

      // additional settings
      { path: "/profile", element: <Profile /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;