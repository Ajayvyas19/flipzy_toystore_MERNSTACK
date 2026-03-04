import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaUser } from "react-icons/fa"; 

export default function ProfileCard({ user, setUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [setUser]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/logout", {}, { withCredentials: true });
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
      alert("❌ Logout failed!");
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-lg">⚠ Please login to view profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white mt-5">.
      <header className="bg-gray-800 shadow p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>
      </header>

      <div className="container mx-auto py-10 grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        <aside className="bg-gray-800 rounded-xl shadow p-5 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-gray-700 pb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl transition-transform transform hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #4f46e5, #9333ea)",
              }}
            >
              <FaUser /> {/* ✅ generic user icon */}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            <Link
              to="/profile"
              className="px-3 py-2 rounded hover:bg-blue-700 transition"
            >
              My Profile
            </Link>
            {user.role === "admin" ? (
              <Link
                to="/admin"
                className="px-3 py-2 rounded hover:bg-yellow-600 transition text-yellow-400"
              >
                Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/my-orders"
                className="px-3 py-2 rounded hover:bg-blue-700 transition text-blue-300"
              >
                My Orders
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded hover:bg-red-600 transition text-red-400"
            >
              Logout
            </button>
          </nav>
        </aside>

        <main className="col-span-2 bg-gray-800 rounded-xl shadow p-6 flex flex-col gap-6">
          <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">
            Profile Information
          </h2>

          <div className="space-y-3">
            <p className="flex items-center gap-2 text-gray-300">
              <span className="w-6">📧</span>
              Email: <span className="font-medium">{user.email}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-300">
              <span className="w-6">🛡️</span>
              Role: <span className="font-medium">{user.role}</span>
            </p>
            {user.created_at && (
              <p className="flex items-center gap-2 text-gray-300">
                <span className="w-6">📅</span>
                Member Since:{" "}
                <span className="font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            {user.role === "admin" ? (
              <Link
                to="/admin"
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow transition flex items-center gap-2"
              >
                Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/my-orders"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg shadow transition flex items-center gap-2"
              >
                View Orders
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg shadow transition flex items-center gap-2"
            >
              Logout  
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
