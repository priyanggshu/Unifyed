// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/Theme_Context";
import { AuthProvider } from "./context/Auth_Context";
import { ChatProvider } from "./context/Chat_Context";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatPage from "./pages/ChatPage";
import AdminDashboard from "./pages/AdminDashboard";

const App = () => {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
};

export default App;
