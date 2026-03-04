import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const user =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user"));
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : null),
    [token]
  );

  const normalizeUrl = useCallback((u) => {
    if (!u) return "";
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    if (u.startsWith("/")) return `${API_BASE}${u}`;
    return `${API_BASE}/${u}`;
  }, []);

  const didFetchRef = useRef(false);

  const fetchOrders = useCallback(async () => {
    if (!user || !authHeaders) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const endpoint =
        user.role === "admin"
          ? `${API_BASE}/api/orders` // admin → all
          : `${API_BASE}/api/orders/my`; // user → own

      const res = await axios.get(endpoint, {
        headers: authHeaders,
        withCredentials: true,
      });

      const list = Array.isArray(res.data) ? res.data : [];
      const mapped = list.map((o) => ({
        ...o,
        products: (o.products || []).map((p) => ({
          ...p,
          image: normalizeUrl(p.image || p.img || ""),
        })),
      }));
      setOrders(mapped);
    } catch (err) {
      console.error("Error fetching orders:", err.response?.data || err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user, authHeaders, normalizeUrl]);

  useEffect(() => {
    if (!user || !authHeaders) {
      setLoading(false);
      return;
    }
    if (process.env.NODE_ENV !== "production") {
      if (didFetchRef.current) return;
      didFetchRef.current = true;
    }
    fetchOrders();
  }, [user, authHeaders, fetchOrders]);

  if (!user || !token) {
    return (
      <div className="flex justify-center mt-16">
        <div className="bg-yellow-400 text-black px-6 py-4 rounded-lg shadow-lg text-center">
          ⚠️ Please log in to view orders.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-900">
        <p className="text-lg text-cyan-400 animate-pulse">Loading orders...</p>
      </div>
    );
  }

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const addDays = (date, days) => {
    const dt = new Date(date);
    dt.setDate(dt.getDate() + days);
    return dt;
  };

  const calcOrderTotal = (order) =>
    (order.products || []).reduce(
      (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0),
      0
    );

  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      if (!authHeaders) return;
      await axios.patch(
        `${API_BASE}/api/orders/${orderId}/status`,
        { status: nextStatus },
        { headers: authHeaders }
      );
      await fetchOrders();
    } catch (err) {
      console.error("Update status error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-900 min-h-screen text-gray-100">
      <h2 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
        📦 Customer Orders
      </h2>

      {orders.length > 0 ? (
        <>
          {/* Mobile Card View */}
          <div className="grid gap-6 sm:hidden">
            {orders.map((order) => {
              const total = calcOrderTotal(order);
              const etaStart = addDays(order.createdAt, 3);
              const etaEnd = addDays(order.createdAt, 4);

              return (
                <div
                  key={order._id}
                  className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-lg">
                      {order.customerName || "Customer"}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === "Delivered"
                          ? "bg-green-600"
                          : order.status === "Shipped"
                          ? "bg-blue-600"
                          : order.status === "Pending"
                          ? "bg-yellow-400 text-black"
                          : "bg-red-600"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </div>

                  <p className="text-sm text-cyan-300 break-all">
                    {order.email || "-"}
                  </p>
                  <p className="text-sm text-gray-400 mb-2">
                    {order.phone || "-"}
                  </p>

                  {/* Products */}
                  <div className="space-y-2 mb-3">
                    {(order.products || []).map((p, i) => {
                      const price = Number(p.price) || 0;
                      const qty = Number(p.quantity) || 0;
                      const subtotal = price * qty;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-gray-900 p-2 rounded-md"
                        >
                          {p.image && (
                            <img
                              src={p.image}
                              alt={p.name || "Product"}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          )}
                          <div className="text-xs">
                            <p className="font-semibold">{p.name || "-"}</p>
                            <p className="text-gray-400">Qty: {qty}</p>
                            <p className="text-gray-400">
                              Price: ₹{price.toLocaleString("en-IN")}
                            </p>
                            <p className="text-gray-300 font-bold">
                              Subtotal: ₹{subtotal.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-sm font-bold text-cyan-400 mb-2">
                    <span>Total:</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="text-xs text-gray-400 mb-1">
                    Ordered: {formatDate(order.createdAt)} {formatTime(order.createdAt)}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    ETA: {formatDate(etaStart)} - {formatDate(etaEnd)}
                  </div>

                  <div className="mt-2">
                    <select
                      className="bg-gray-900 border border-gray-700 text-gray-100 text-xs rounded px-2 py-1"
                      value={order.status || "Pending"}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto shadow-xl rounded-2xl border border-gray-700">
            <table className="min-w-full text-sm text-gray-300">
              <thead className="bg-gray-800 text-gray-200 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Products</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Ordered</th>
                  <th className="px-4 py-3">ETA</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const total = calcOrderTotal(order);
                  const etaStart = addDays(order.createdAt, 3);
                  const etaEnd = addDays(order.createdAt, 4);

                  return (
                    <tr
                      key={order._id}
                      className="border-t border-gray-700 hover:bg-gray-800"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold">
                          {order.customerName || "Customer"}
                        </div>
                        <div className="text-xs text-cyan-300">{order.email}</div>
                        <div className="text-xs text-gray-400">{order.phone}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          {(order.products || []).map((p, i) => (
                            <div key={i} className="flex items-center gap-2">
                              {p.image && (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              )}
                              <div className="text-xs">
                                <p className="font-medium">{p.name}</p>
                                <p className="text-gray-400">
                                  Qty: {p.quantity} × ₹
                                  {Number(p.price).toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-bold text-cyan-400 text-center">
                        ₹{total.toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-3 text-xs text-center">
                        {formatDate(order.createdAt)} <br />
                        {formatTime(order.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-xs text-center">
                        {formatDate(etaStart)} - {formatDate(etaEnd)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <select
                          className="bg-gray-900 border border-gray-700 text-gray-100 text-xs rounded px-2 py-1"
                          value={order.status || "Pending"}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-400 mt-10 text-lg">
          🚫 No orders found
        </div>
      )}
    </div>
  );
}
