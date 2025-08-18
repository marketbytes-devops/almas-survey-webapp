import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Layout from "./components/Layout";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: AdminDashboard },
    ]
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App