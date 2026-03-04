import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000";
const PLACEHOLDER = "https://via.placeholder.com/50x50?text=No+Image";

export default function MyOrders() {
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

  useEffect(() => {
    if (!user || !authHeaders) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    axios
      .get("http://localhost:5000/api/orders/my", {
        headers: authHeaders,
        withCredentials: true,
      })
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const mapped = list.map((o) => ({
          ...o,
          products: (o.products || []).map((p) => ({
            ...p,
            image: normalizeUrl(p.image || p.img || ""),
          })),
        }));
        setOrders(mapped);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Error fetching orders:", err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, authHeaders, normalizeUrl]);

  if (!user || !token) {
    return (
      <div className="d-flex justify-content-center mt-10">
        <div className="alert alert-warning text-center" role="alert">
          ⚠️ Please log in to view your orders.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-10">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="alert alert-info text-center mt-5" role="alert">
          You haven’t placed any orders yet 🚫
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 mt-5">.
      <h2 className="text-3xl font-bold mb-6 text-light text-center ">My Orders</h2>
      <div className="row g-4">
        {orders.map((order) => (
          <div key={order._id} className="col-12 col-md-6 col-lg-4">
            <div className="card bg-gray-900 text-light border-secondary shadow-lg h-100 hover:scale-105 transition-transform duration-300">
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <h5 className="card-title text-primary">Order ID: {order.orderId}</h5>
                  <p className="card-text mb-1">
                    <strong>Date:</strong>{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge ${
                        order.status === "Delivered"
                          ? "bg-success"
                          : order.status === "Cancelled"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </p>
                </div>

                {order.products.length > 0 && (
                  <div
                    id={`carousel-${order._id}`}
                    className="carousel slide my-3"
                    data-bs-ride="carousel"
                  >
                    <div className="carousel-inner">
                      {order.products.map((p, idx) => (
                        <div
                          key={idx}
                          className={`carousel-item ${idx === 0 ? "active" : ""}`}
                        >
                          <div className="d-flex align-items-center justify-content-between bg-gray-800 p-2 rounded hover:scale-105 transition-transform cursor-pointer">
                            <img
                              src={p.image || PLACEHOLDER}
                              alt={p.name}
                              className="d-block rounded me-3"
                              style={{ width: "50px", height: "50px", objectFit: "cover" }}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = PLACEHOLDER;
                                e.currentTarget.style.objectFit = "contain";
                              }}
                              loading="lazy"
                            />
                            <div className="flex-grow-1">
                              <p className="mb-0">{p.name}</p>
                              <small>
                                ₹{Number(p.price).toLocaleString("en-IN")} × {p.quantity}
                              </small>
                            </div>
                            <strong className="text-success">
                              ₹{(Number(p.price) * Number(p.quantity)).toLocaleString("en-IN")}
                            </strong>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.products.length > 1 && (
                      <>
                        <button
                          className="carousel-control-prev"
                          type="button"
                          data-bs-target={`#carousel-${order._id}`}
                          data-bs-slide="prev"
                          style={{ cursor: "pointer" }}
                        >
                          <span
                            className="carousel-control-prev-icon"
                            aria-hidden="true"
                          ></span>
                          <span className="visually-hidden">Previous</span>
                        </button>
                        <button
                          className="carousel-control-next"
                          type="button"
                          data-bs-target={`#carousel-${order._id}`}
                          data-bs-slide="next"
                          style={{ cursor: "pointer" }}
                        >
                          <span
                            className="carousel-control-next-icon"
                            aria-hidden="true"
                          ></span>
                          <span className="visually-hidden">Next</span>
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className="mt-2">
                  <p className="mb-1">
                    <strong>Payment:</strong> {order.payment || "Not Paid"}
                  </p>
                  <p className="mb-1">
                    <strong>Shipping:</strong>{" "}
                    {order.shipping?.address}, {order.shipping?.city},{" "}
                    {order.shipping?.state}, {order.shipping?.zip},{" "}
                    {order.shipping?.country}
                  </p>
                </div>

                <div className="mt-3 text-end">
                  <p className="fw-bold text-success mb-0">
                    Total: ₹
                    {order.products
                      .reduce(
                        (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 0),
                        0
                      )
                      .toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
