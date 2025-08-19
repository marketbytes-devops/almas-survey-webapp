import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import Layout from "./components/Layout";
import SalesDashboard from "./pages/Dashboard/SalesDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import Enquiries from "./pages/Enquiries";
import ProcessingEnquiries from "./pages/ProcessingEnquiries";
import FollowUps from "./pages/FollowUps";
import ScheduledSurveys from "./pages/ScheduledSurveys";
import NewEnquiries from "./pages/NewEnquiries";
import Profile from "./pages/AdditionalSettings/Profile";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Users from "./pages/Admin/Users";
import Permissions from "./pages/Admin/Permissions";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuth, AuthProvider } from "./hooks/useAuth";

const ProtectedRoute = ({ children, allowedRoles, requiredPermission }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-[#2d4a5e]">Loading...</div>;
  }

  if (user && ["/login", "/forgot-password", "/reset-password"].includes(window.location.pathname)) {
    return <Navigate to="/" />;
  }

  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  if (user.role === "sales" && requiredPermission && !user.permissions.includes(requiredPermission)) {
    return <Navigate to="/" />;
  }
  return typeof children === "function" ? children(user) : children;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={["admin", "sales"]} requiredPermission="dashboard">
            {user => (user.role === "admin" ? <AdminDashboard /> : <SalesDashboard />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "/enquiries",
        element: (
          <ProtectedRoute allowedRoles={["admin", "sales"]} requiredPermission="enquiries">
            <Enquiries />
          </ProtectedRoute>
        ),
      },
      {
        path: "/processing-enquiries",
        element: (
          <ProtectedRoute allowedRoles={["admin", "sales"]} requiredPermission="processing-enquiries">
            <ProcessingEnquiries />
          </ProtectedRoute>
        ),
      },
      {
        path: "/follow-ups",
        element: (
          <ProtectedRoute allowedRoles={["admin", "sales"]} requiredPermission="follow-ups">
            <FollowUps />
          </ProtectedRoute>
        ),
      },
      {
        path: "/scheduled-surveys",
        element: (
          <ProtectedRoute allowedRoles={["admin", "sales"]} requiredPermission="scheduled-surveys">
            <ScheduledSurveys />
          </ProtectedRoute>
        ),
      },
      {
        path: "/new-enquiries",
        element: (
          <ProtectedRoute allowedRoles={["admin", "sales"]} requiredPermission="new-enquiries">
            <NewEnquiries />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute allowedRoles={["admin", "sales"]} requiredPermission="profile">
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/users",
        element: (
          <ProtectedRoute allowedRoles={["admin"]} requiredPermission="users">
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: "/permissions",
        element: (
          <ProtectedRoute allowedRoles={["admin"]} requiredPermission="permissions">
            <Permissions />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;