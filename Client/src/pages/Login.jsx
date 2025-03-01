import { useState, useContext } from "react";
import { AuthContext } from "../context/Auth_Context.jsx";
import { loginUser } from "../services/authService.js";
import { useNavigate } from "react-router-dom";
import Auth1 from "../assets/Auth1.svg";
import Auth2 from "../assets/Auth2.svg";
import AuthB from "../assets/AuthB.png";
import AuthG from "../assets/AuthG.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await loginUser({ username, password });
      if (!userData || !userData.token) {
        throw new Error("Token missing in login response");
      }
      console.log("Login Successful", userData);
      login(userData);
      navigate("/chat");
    } catch (error) {
      console.error("Login failed", error.response?.data?.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gray-200">
      {/* Left Section */}
      <div className="w-full md:w-1/2 flex flex-col h-screen justify-center items-center bg-green-50 md:bg-gray-50 p-10 shadow-lg">
      <h2 className="md:hidden text-4xl mt-6 mb-[-2rem] scale-x-110 font-bold italic text-blue-950 shadow-xs absolute top-5">Unifyed</h2>
      <div className="border bg-gray-50 border-blue-200 p-4 md:p-8 text-center rounded-2xl shadow-xl">
        <h2 className="text-4xl font-bold mb-3 text-gray-900">Welcome Back</h2>
        <p className="text-gray-700 mb-10 font-light text-center">Log in to continue your journey with Unifyed.</p>

        <form onSubmit={handleSubmit} className="w-80">
          <input
            type="text"
            placeholder="Username"
            className="hover:scale-105 hover:bg-blue-50 w-full p-3 border rounded-2xl placeholder:text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="hover:scale-105 hover:bg-blue-50 w-full p-3 border rounded-2xl placeholder:text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-black text-white p-3 rounded-3xl hover:bg-gray-400 hover:text-black transition">
            Login
          </button>
          <p className="text-gray-600 text-sm mt-4 text-center">
            Don't have an account? <span className="text-green-600 hover:underline font-bold cursor-pointer" onClick={() => navigate("/signup")}>Sign up</span>
          </p>
          <button onClick={() => { setUsername("testuser"); setPassword("testpassword"); handleSubmit(new Event('submit')); }}
            className="mt-3 text-blue-900 bg-blue-300 hover:bg-blue-400 p-3 text-sm font-semibold rounded-3xl hover:underline text-center w-full">
            Quick Login with Test Credentials
          </button>
        </form>
      </div>
      <div className="pt-10">
        <p className="md:hidden scale-105 text-center font-light mt-8 font-stretch-75% italic text-blue-950">
          Unifyed offers seamless communication with WebRTC-powered video/audio calls, 
          end-to-end encryption, and AI-enhanced messaging for a smarter experience.
        </p>
      </div>
      </div>

      {/* Right Section */}
      <div className="w-full hidden md:w-1/2 md:flex flex-col justify-center items-center bg-green-100 p-10 text-center relative">
        <h2 className="text-5xl font-bold italic text-gray-900 absolute top-5">Unifyed</h2>
        
        <img src={AuthB} alt="AuthB" className="absolute top-10 left-4 w-24 h-24 rounded-full" />
        <img src={Auth1} alt="Auth1" className="absolute scale-150 border border-gray-500 rounded-4xl top-48 left-36 w-48 h-48" />
        <img src={Auth2} alt="Auth2" className="absolute scale-150 border border-gray-400 rounded-4xl top-72 right-32 w-48 h-48" />
        <img src={AuthG} alt="AuthG" className="absolute bottom-10 right-4 w-24 h-24 rounded-full" />
        
        <div className="mt-96 flex flex-col items-center">
          <h2 className="text-3xl text-gray-700 mt-20 font-bold">Stay Connected</h2>
          <p className="text-xl mt-4 font-light italic text-gray-800 max-w-md">
            Unifyed offers seamless communication with WebRTC-powered video/audio calls, 
            end-to-end encryption, and AI-enhanced messaging for a smarter experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
