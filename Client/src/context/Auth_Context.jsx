import { createContext, useState, useEffect } from "react";
import { getUserFromLocalStorage } from "../utils/storage.js";
import { getUserProfile } from "../services/authService.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUserFromLocalStorage());

  // Fetch user profile when component mounts/user changes
  useEffect(() => {
    const fetchUser = async () => {
      if (user?.token) {
        try {
          const profile = await getUserProfile(user.token);
          setUser({...profile, token: user.token}); // Update user state with profile details
          localStorage.setItem("user", JSON.stringify(profile));
        } catch (error) {
          console.error("Error fetching user profile:", error);
          logout();
        }
      }
    };
    fetchUser();
  }, []);

  const login = (userData) => {
    if(!userData || !userData.token) {
      console.log("Login error: Token missing in response");
      return;
    }
    console.log("Storing user in context:", userData);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
