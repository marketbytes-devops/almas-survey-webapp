import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setLoading(true);
    setError("");
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      setError("Failed to log out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleLogout}
        disabled={loading}
        className={`text-white text-sm sm:text-base font-medium px-3 py-2 rounded ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#2d4a5e]/20"}`}
        whileTap={{ scale: loading ? 1 : 0.95 }}
        transition={{ duration: 0.3 }}
      >
        {loading ? "Logging out..." : "Logout"}
      </motion.button>
      {error && (
        <p className="absolute text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default Logout;