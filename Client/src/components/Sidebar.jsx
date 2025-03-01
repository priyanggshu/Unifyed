import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../services/authService";
import { AuthContext } from "../context/Auth_Context";
import { ChatContext } from "../context/Chat_Context";
import { BsMoon, BsSun } from "react-icons/bs";
import { AiOutlineLogout, } from "react-icons/ai";

const Sidebar = ({ darkMode, setDarkMode, setView }) => {
  const [users, setUsers] = useState([]);
  const { user } = useContext(AuthContext);
  const { chats, selectChat } = useContext(ChatContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !user?.token) {
        navigate("/");
        return;
      }

      try {
        const data = await getAllUsers(user.token);

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format: Expected an array.");
        }
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users", error.response?.data);
      }
    };
    fetchUsers();
  }, []);

  const handleSelectChat = (chat) => {
    selectChat(chat);
    setView("chat"); 
  };
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className={`relative h-full flex flex-col ${darkMode ? "bg-[#090112] text-white" : "bg-gray-100 text-black"}`}>
      {/* Header */}
      <div className={`p-6 md:p-4 pl-12 md:pl-10 text-3xl md:text-2xl shadow-md font-bold ${darkMode ? "text-[#B985F9]" : "text-gray-900"}`}>Chat</div>
      <button onClick={() => setDarkMode(!darkMode) }
          className={`block md:hidden absolute right-5 top-9 scale-125 md:scale-none pb-4 items-center md:gap-2 md:p-2 hover:cursor-grab hover:scale-110 rounded-full transition-all ${darkMode ? "hover:bg-gray-black border-gray-600" : "hover:bg-gray-200 border-gray-300"}`}
        >
          {darkMode ? <BsSun className="text-yellow-500 scale-125" /> : <BsMoon className="text-yellow-black" />}
        </button>
      
      {/* User Info */}
      <div className=" flex flex-col items-center text-center pt-5 md:pt-0">
        <img src={user?.avatar} alt="User Avatar" className="w-32 h-32 md:w-28 md:h-28 md:mt-4 rounded-full border-2 border-blue-200" />
        
        <h2 className={`mt-1 md:mt-3 ${darkMode ? "text-[#EADBFE]" : "text-sky-950"} text-2xl md:text-xl font-bold`}>{user?.username}</h2>
        <p className={`text-sm md:text-xs my-1 md:mt-[2px] ${darkMode ? "text-fuchsia-50" : "text-gray-700"}`}>{user?.email}</p>
        <span className="my-2 scale-110 md:scale-none md:mt-3 bg-[#BBE8E3] text-[#03A184] text-xs px-3 py-2 rounded-full">Connected</span>

        {/* Dark Mode Toggle */}
        <button onClick={() => setDarkMode(!darkMode) }
          className={`hidden md:block scale-125 md:scale-none pb-4 items-center md:gap-2 md:p-2 hover:cursor-grab hover:scale-110 rounded-full transition-all ${darkMode ? "hover:bg-gray-black border-gray-600" : "hover:bg-gray-200 border-gray-300"}`}
        >
          {darkMode ? <BsSun className="text-yellow-500 scale-125" /> : <BsMoon className="text-yellow-black" />}
        </button>
      </div>
      
      {/* Search Bar */}
      <div className={`px-5 md:px-4 pb-4 border-b ${darkMode ? "border-none" : "border-gray-100"}  border-gray-100`}>
        <input
          type="text"
          placeholder="Search..."
          className={`w-full ${darkMode ? "bg-[#341e4b] text-white border-[#6B1FC0]" : "bg-[#F0F5F6] border-gray-300"} placeholder:text-sm p-2 border rounded-2xl focus:ring-1 focus:ring-blue-200 outline-none`}
        />
      </div>
      
      {/* Users List */}
      <div className="flex-grow pr-3 mx-1 rounded-xl overflow-y-auto p-2">
        <p className={`md:text-sm font-semibold pl-1 pb-3 ${darkMode ? "text-gray-200" : "text-gray-500"}`}>Latest Chats</p>
        {users.map((otherUser) => (
          <div
            key={otherUser._id}
            className={`flex items-center py-3 border ${darkMode ? "border-[#38353b] rounded-2xl" : "border-green-100 rounded-xl"}  hover:${darkMode ? "bg-gray-400" : "bg-gray-200"} cursor-pointer`}
            onClick={() => handleSelectChat(otherUser)}
          >
            <img src={otherUser.avatar || "https://via.placeholder.com/40"} alt="User Avatar" className="w-13 h-13 m-1 rounded-full mr-3 border border-yellow-200" />
            <div>
            <h3 className={`text-gray-600 font-bold ${darkMode ? "text-white" : "text-gray-600"}`}>
                {otherUser.username}
              </h3>
              <p className={`text-xs italic ${darkMode ? "text-[#d1c7ca]" : "text-gray-500"}`}>Last seen recently</p>
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