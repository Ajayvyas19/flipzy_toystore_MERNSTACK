// App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AuthForm from "./pages/AuthForm";
import UserDashboardPage from "./pages/UserDashboardPage";
import Homepage from "./pages/Homepage";
import AdminPanel from "./pages/AdminPanel";
import UpdateToy from "./components/UpdateToy";
import Aboutpage from "./pages/Aboutpage";
import ProfilePage from "./components/ProfileCard";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CheckoutPage from "./components/CheckoutPage";
import { CartProvider } from "./components/CartContext";
import MyOrders from "./components/MyOrders";

const AdminRoute = ({ user, children }) => {
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/register" replace />;
  }
  return <>{children}</>;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <CartProvider>
      <Router>
        {/* Full Page Layout */}
        <div className="min-h-screen flex flex-col">

          {/* Header always on top */}
          <Header user={user} setUser={setUser} />

          {/* Main Content - Push footer down */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/aboutpage" element={<Aboutpage />} />
              <Route
                path="/register"
                element={<AuthForm setUser={setUser} />}
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute user={user}>
                    <AdminPanel />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/toys/edit/:id"
                element={
                  <AdminRoute user={user}>
                    <UpdateToy />
                  </AdminRoute>
                }
              />

              {/* User Routes */}
              <Route path="/user" element={<UserDashboardPage />} />
              <Route
                path="/profile"
                element={<ProfilePage user={user} setUser={setUser} />}
              />
              <Route path="/checkout" element={<CheckoutPage />} />

              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute user={user}>
                    <MyOrders user={user} />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          {/* Footer always sticks at bottom */}
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
