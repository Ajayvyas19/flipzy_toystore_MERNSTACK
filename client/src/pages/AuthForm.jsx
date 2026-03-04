import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function AuthForm({ setUser }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // field-level errors coming from backend { field, msg }
  const [errors, setErrors] = useState([]);
  // popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupBody, setPopupBody] = useState("");

  // Close popup on Esc
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setPopupOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fieldError = (field) =>
    errors.find((e) => e.field === field)?.msg || null;

  const showPopup = (title, body) => {
    setPopupTitle(title);
    setPopupBody(body);
    setPopupOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors.length) {
      setErrors((prev) => prev.filter((er) => er.field !== e.target.name));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      if (isLogin) {
        const res = await axios.post(
          "http://localhost:5000/api/login",
          { email: formData.email, password: formData.password },
          { withCredentials: true }
        );

        const userData = res.data.user;
        const token = res.data.token;

        if (rememberMe) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("user", JSON.stringify(userData));
        }

        setUser(userData);
        showPopup("Success", "✅ Login successful!");
        setTimeout(
          () => navigate(userData.role === "admin" ? "/admin" : "/user", { replace: true }),
          500
        );
      } else {
        // Registration
        const res = await axios.post("http://localhost:5000/api/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        if (res.status === 201 || res.status === 200) {
          showPopup("Success", "✅ Registration successful! Please log in.");
          setIsLogin(true);
        }
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 400 && data?.errors?.length) {
        setErrors(data.errors);
        const list = data.errors.map((e) => `• ${e.msg}`).join("\n");
        showPopup(data.message || "Validation failed", list);
      } else if (status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        showPopup("Authentication error", data?.message || "❌ Session expired. Please log in again.");
        if (!isLogin) {
          // On register flow 401, go to login after brief delay
          setTimeout(() => navigate("/login", { replace: true }), 800);
        }
      } else {
        showPopup("Error", data?.message || "❌ Authentication failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full px-3 py-2 bg-[#2b2f36] border rounded-lg text-white focus:outline-none focus:ring-2";
  const inputOk = "border-gray-600 focus:ring-blue-500";
  const inputErr = "border-red-500 focus:ring-red-500";

  return (
    <section className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0d1117] to-[#161b22]">
      {/* Popup Modal */}
      {popupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setPopupOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[90%] max-w-md bg-[#1f2430] border border-gray-700 rounded-2xl shadow-2xl p-6 text-gray-100">
            <h3 className="text-xl font-bold mb-3">{popupTitle}</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-300 mb-4">
              {popupBody}
            </pre>
            <div className="flex justify-end">
              <button
                onClick={() => setPopupOpen(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative flex flex-col md:flex-row w-[90%] max-w-5xl shadow-2xl rounded-2xl overflow-hidden bg-[#1d2025]/90 backdrop-blur-md border border-gray-700">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 text-white p-10 transition-all duration-500 ease-in-out">
          <h1 className="text-4xl font-bold mb-4">Welcome to Flipzy 🎉</h1>
          <p className="text-lg text-gray-200 mb-6 text-center">
            {isLogin
              ? "New here? Create your account and start exploring awesome toys."
              : "Already a member? Log in to continue your toy adventure!"}
          </p>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors([]);
            }}
            className="px-6 py-2 rounded-full bg-white text-blue-600 font-bold shadow-lg hover:scale-105 hover:shadow-2xl transition"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>

        {/* Right Panel (Form) */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-white">
            {isLogin ? "Sign in to Flipzy" : "Create your account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block mb-1 text-sm text-gray-300">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${inputBase} ${
                    fieldError("name") ? inputErr : inputOk
                  }`}
                  aria-invalid={!!fieldError("name")}
                />
                {fieldError("name") && (
                  <p className="mt-1 text-xs text-red-400">{fieldError("name")}</p>
                )}
              </div>
            )}

            <div>
              <label className="block mb-1 text-sm text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${inputBase} ${
                  fieldError("email") ? inputErr : inputOk
                }`}
                aria-invalid={!!fieldError("email")}
              />
              {fieldError("email") && (
                <p className="mt-1 text-xs text-red-400">{fieldError("email")}</p>
              )}
            </div>

            <div className="relative">
              <label className="block mb-1 text-sm text-gray-300">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${inputBase} ${
                  fieldError("password") ? inputErr : inputOk
                }`}
                aria-invalid={!!fieldError("password")}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 cursor-pointer text-gray-400 hover:text-blue-400 transition"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {fieldError("password") && (
                <p className="mt-1 text-xs text-red-400">{fieldError("password")}</p>
              )}
            </div>

            {isLogin && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-400">
                  Keep me logged in
                </label>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 hover:scale-105 hover:shadow-2xl transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Processing..." : isLogin ? "Log in" : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <span
                  onClick={() => {
                    setIsLogin(false);
                    setErrors([]);
                  }}
                  className="text-blue-400 font-bold cursor-pointer hover:underline"
                >
                  Sign up
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  onClick={() => {
                    setIsLogin(true);
                    setErrors([]);
                  }}
                  className="text-blue-400 font-bold cursor-pointer hover:underline"
                >
                  Log in
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
