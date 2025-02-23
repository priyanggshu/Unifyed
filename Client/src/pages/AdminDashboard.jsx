import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: userData } = await axios.get("/api/admin/users");
        const { data: statsData } = await axios.get("/api/admin/stats");
        setUsers(userData);
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Error deleting user", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-100 rounded shadow">
          <h2 className="text-xl">Total Messages</h2>
          <p className="text-3xl">{stats.totalMessages}</p>
        </div>
        <div className="p-4 bg-green-100 rounded shadow">
          <h2 className="text-xl">Active Users (24h)</h2>
          <p className="text-3xl">{stats.activeUsers}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-6">Users</h2>
      <table className="w-full mt-2 border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Username</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="text-center">
              <td className="border p-2">{user.username}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.role}</td>
              <td className="border p-2">
                <button onClick={() => handleDeleteUser(user._id)} className="bg-red-500 text-white px-3 py-1 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
