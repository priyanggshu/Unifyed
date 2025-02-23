import api from "./api";

export const signupUser = async (userData) => {
  const response = await api.post("/auth/signup", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post("/auth/login", userData);
  console.log("Login Response:", response.data);
  if(!response.data.token) {
    throw new Error("Token missing in API response");
  }
  return response.data;
};

export const getAllUsers = async (token) => {
  try {
    console.log("🔄 Sending request with token:", token);
    
    const response = await api.get("/users", {
      headers: { Authorization: `Bearer ${token}`}
    });
    console.log("✅ API Response:", response.data); // Debugging

    if (!response.data) {
      throw new Error("No data received from API");
    }

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching users:", error.response?.data || error.message);
    return []; // Return an empty array instead of undefined to prevent crashes
  }
}

export const getUserProfile = async (token) => {
  const response = await api.get("/users/profile", {
    headers: { Authorization: `Bearer ${token}`},
  });
  return response.data;
};
