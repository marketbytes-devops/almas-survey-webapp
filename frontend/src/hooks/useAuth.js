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
      if (parsedUser.permissions && typeof parsedUser.permissions === "object" && "permissions" in parsedUser.permissions) {
        parsedUser.permissions = parsedUser.permissions.permissions;
      }
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    if (userData.permissions && typeof userData.permissions === "object" && "permissions" in userData.permissions) {
      userData.permissions = userData.permissions.permissions;
    }
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
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

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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