import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/Auth_Context";
import { ChatProvider } from "./context/Chat_Context";
import { useContext, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatPage from "./pages/Chatpage";
import AdminDashboard from "./pages/AdminDashboard";
import LogRocket from "logrocket";
import posthog from "posthog-js";

LogRocket.init("tzrop0/unifyed");

const AppContent = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      LogRocket.identify(user._id, {
        name: user.username,
        email: user.email,
      });

      posthog.identify(user._id, {
        name: user.username,
        email: user.email,
      });

      posthog.capture("User Logged In", { userId: user._id });
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </AuthProvider>
  );
};

export default App;
