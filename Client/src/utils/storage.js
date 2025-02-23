
export const getUserFromLocalStorage = () => {
  try {
    const user = localStorage.getItem("user");
    if(!user) return null;

    console.log((`user: ${user}`))
    return JSON.parse(user);
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    localStorage.removeItem("user");
    return null;
  }
  };
  