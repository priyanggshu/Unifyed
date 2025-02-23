import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../services/authService";
import { AuthContext } from "../context/Auth_Context";
import { CiSearch } from "react-icons/ci";
import { AiOutlineLogout } from "react-icons/ai";
import { ChatContext } from "../context/Chat_Context";

const Sidebar = ({ }) => {
  const [users, setUsers] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const { chats, selectChat } = useContext(ChatContext);
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !user?.token) {
        navigate("/");
        return;
      }

      try {
        console.log("🔄 Fetching users with token:", user.token);
        const data = await getAllUsers(user.token);

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format: Expected an array.");
        }

        console.log("✅ Users fetched from API:", data);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users", error.response?.data);
      }
    };
    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className=" h-screen bg-white shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-4 pl-10 text-2xl shadow-sm font-bold text-gray-900">Chat</div>
      
      {/* User Info */}
      <div className="p-4 flex flex-col items-center text-center">
        <img src={user?.avatar} alt="User Avatar" className="w-28 h-28 rounded-full border-2 border-blue-200" />
        <h2 className="mt-3 text-sky-950 text-xl font-bold">{user?.username}</h2>
        <p className="text-xs mt-[2px] text-gray-700">{user?.email}</p>
        <span className="mt-3 bg-[#BBE8E3] text-[#03A184] text-xs px-3 py-2 rounded-full">Connected</span>
      </div>
      
      {/* Search Bar */}
      <div className="px-4 pb-4 border-b border-gray-100">
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-[#F0F5F6] placeholder:text-sm p-2 border border-gray-300 rounded-2xl focus:ring-1 focus:ring-blue-200 outline-none"
        />
        <CiSearch className="absolute text-gray-600 scale-125 left-75 top-81 " />
      </div>
      
      {/* Users List */}
      <div className="flex-grow pr-3 mx-1 rounded-xl overflow-y-auto p-2">
        <p className="text-sm font-semibold pl-1 pb-3  text-gray-500">Latest Chats</p>
        {users.map((otherUser) => (
          <div
            key={otherUser._id}
            className="flex items-center py-3 border border-green-100 hover:bg-gray-200 rounded-xl cursor-pointer"
            onClick={() => selectChat(otherUser)}
          >
            <img src={otherUser.avatar || "https://via.placeholder.com/40"} alt="User Avatar" className="w-13 h-13 m-1 rounded-full mr-3 border border-yellow-200" />
            <div>
              <h3 className="text-gray-600 font-bold">{otherUser.username}</h3>
              <p className="text-sm italic text-gray-500">Last seen recently</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Logout Button */}
      <button className="mb-8 pt-3 flex justify-evenly items-center bg-red-400 hover:scale-105 hover:bg-red-600 text-black p-3 w-auto z-10 rounded-3xl mx-auto" onClick={handleLogout}>
        <AiOutlineLogout className="w-5 h-5 scale-110 cursor-pointer" />
      </button>
    </div>
  );
};

export default Sidebar;