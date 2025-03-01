// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthContext, AuthProvider } from "./context/Auth_Context";
import { ChatProvider } from "./context/Chat_Context";
import { useContext, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatPage from "./pages/ChatPage";
import AdminDashboard from "./pages/AdminDashboard";
import LogRocket from 'logrocket';
import posthog from "posthog-js";


LogRocket.init('tzrop0/unifyed');

const App = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      LogRocket.identify(user._id, {
        name: user.username,
        email: user.email,
      });
    }
  }, [user]); 

  useEffect(() => {
    if (user) {
      posthog.identify(user._id, {
        name: user.username,
        email: user.email,
      });

      posthog.capture("User Logged In", { userId: user._id });
    }
  }, [user]);

  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
};

export default App;
