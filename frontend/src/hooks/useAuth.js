import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const storedRefreshToken = localStorage.getItem("refresh_token");
    if (storedUser && storedToken && storedRefreshToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  const login = async (userData, accessToken, refreshToken) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/auth/permissions/${userData.id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const updatedUserData = {
        id: userData.id,
        name: userData.name || "Unknown User",
        email: userData.email,
        roles: response.data.roles || userData.roles || [],
        permissions: response.data.permissions || [],
        enable_email_receiver: userData.enable_email_receiver || false,
      };
      setUser(updatedUserData);
      localStorage.setItem("user", JSON.stringify(updatedUserData));
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
    } catch (err) {
      console.error("Failed to fetch permissions", err);
      const fallbackUserData = {
        id: userData.id,
        name: userData.name || "Unknown User",
        email: userData.email,
        roles: userData.roles || [],
        permissions: [],
        enable_email_receiver: userData.enable_email_receiver || false,
      };
      setUser(fallbackUserData);
      localStorage.setItem("user", JSON.stringify(fallbackUserData));
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/api/auth/logout/", {
        refresh: localStorage.getItem("refresh_token"),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
    } catch (err) {
      console.error("Logout failed:", err);
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
    }
  };

  const assignRole = async (roleName, email) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/auth/roles/${encodeURIComponent(roleName)}/${encodeURIComponent(email)}/`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (user && user.email === email) {
        const updatedUser = { 
          ...user, 
          roles: response.data.user.roles || [],
          enable_email_receiver: response.data.user.enable_email_receiver || user.enable_email_receiver
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      return response.data;
    } catch (err) {
      console.error("Failed to assign role:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, assignRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};