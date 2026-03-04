import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProfileCard({ user, setUser }) {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

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
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Please login to view profile.</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"
      }`}
    >
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="btn btn-sm btn-outline-secondary"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <div
        className={`p-8 rounded-2xl shadow-lg text-center w-full max-w-md ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <img
          src={user.profilePicture || "https://i.pravatar.cc/150"}
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto border-4 border-indigo-500 object-cover"
        />
        <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>

        <p className="mt-6 text-sm">
          From your account dashboard you can edit your{" "}
          <a href="/profile" className="text-indigo-600 hover:underline">
            Profile Details
          </a>{" "}
          and{" "}
          <a href="/password" className="text-indigo-600 hover:underline">
            Edit Your Password
          </a>
        </p>

        <p className="mt-6 text-sm">
          Not <span className="font-semibold">{user.name}</span>?{" "}
          <button
            onClick={handleLogout}
            className="text-red-500 hover:underline font-medium"
          >
            Sign Out
          </button>
        </p>
      </div>
    </div>
  );
}
