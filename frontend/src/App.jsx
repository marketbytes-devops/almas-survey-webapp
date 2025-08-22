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
import Roles from "./pages/Admin/Roles";
import ErrorBoundary from "./components/ErrorBoundary";
import { useAuth, AuthProvider } from "./hooks/useAuth";

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-[#2d4a5e]">Loading...</div>;
  }

  if (user && ["/login", "/forgot-password", "/reset-password"].includes(window.location.pathname)) {
    return <Navigate to="/" />;
  }

  if (!user) return <Navigate to="/login" />;

  const hasRequiredPermission = requiredPermission ? user.permissions.includes(requiredPermission) : true;

  if (!hasRequiredPermission) {
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
          <ProtectedRoute requiredPermission="dashboard">
            {user => (user.permissions.includes("users") ? <AdminDashboard /> : <SalesDashboard />)}
          </ProtectedRoute>
        ),
      },
      {
        path: "/enquiries",
        element: (
          <ProtectedRoute requiredPermission="enquiries">
            <Enquiries />
          </ProtectedRoute>
        ),
      },
      {
        path: "/processing-enquiries",
        element: (
          <ProtectedRoute requiredPermission="processing-enquiries">
            <ProcessingEnquiries />
          </ProtectedRoute>
        ),
      },
      {
        path: "/follow-ups",
        element: (
          <ProtectedRoute requiredPermission="follow-ups">
            <FollowUps />
          </ProtectedRoute>
        ),
      },
      {
        path: "/scheduled-surveys",
        element: (
          <ProtectedRoute requiredPermission="scheduled-surveys">
            <ScheduledSurveys />
          </ProtectedRoute>
        ),
      },
      {
        path: "/new-enquiries",
        element: (
          <ProtectedRoute requiredPermission="new-enquiries">
            <NewEnquiries />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute requiredPermission="profile">
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/users",
        element: (
          <ProtectedRoute requiredPermission="users">
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: "/permissions",
        element: (
          <ProtectedRoute requiredPermission="permissions">
            <Permissions />
          </ProtectedRoute>
        ),
      },
      {
        path: "/roles",
        element: (
          <ProtectedRoute requiredPermission="roles">
            <Roles />
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