import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";

import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

const AllToys = () => {
  const [toys, setToys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const normalizeImageUrl = useCallback((img) => {
    if (!img) return "";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("/")) return `${API_BASE}${img}`;
    return `${API_BASE}/${img}`;
  }, []);

  const fetchToys = useCallback(() => {
    setLoading(true);
    axios
      .get(`${API_BASE}/api/toys`)
      .then((res) => {
        const mapped = (res.data || []).map((t) => ({
          ...t,
          image: normalizeImageUrl(t.image),
        }));
        // Newest first (fallback if backend doesn't sort)
        mapped.sort((a, b) => {
          const da = new Date(a.createdAt || a.updatedAt || 0).getTime();
          const db = new Date(b.createdAt || b.updatedAt || 0).getTime();
          return db - da;
        });
        setToys(mapped);
      })
      .catch((err) => {
        console.error("Error fetching toys:", err);
      })
      .finally(() => setLoading(false));
  }, [normalizeImageUrl]);

  useEffect(() => {
    fetchToys();
  }, [fetchToys]);

  const handleDelete = async (toyId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this toy?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      alert("You are not authorized to delete toys.");
      return;
    }

    try {
      await axios.delete(`${API_BASE}/api/toys/${toyId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      alert("✅ Toy deleted successfully!");
      fetchToys();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "❌ Failed to delete toy.");
    }
  };

  const handleUpdate = (toyId) => {
    navigate(`/admin/toys/edit/${toyId}`);
  };

  const filteredToys = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return toys;
    return toys.filter((toy) => {
      const name = toy.name?.toLowerCase?.() || "";
      const category = toy.category?.toLowerCase?.() || "";
      const brand = toy.brand?.toLowerCase?.() || "";
      return name.includes(q) || category.includes(q) || brand.includes(q);
    });
  }, [toys, searchQuery]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          height: "80vh",
          background: "rgba(240, 240, 240, 0.8)",
        }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            style={{ width: "4rem", height: "4rem" }}
            role="status"
            aria-label="Loading"
          ></div>
          <p className="mt-3 fs-5 fw-bold text-dark">Loading Toys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-100 px-3 px-md-4 py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 justify-content-between mb-4">
        <div>
          <h3 className="m-0 fw-bold text-dark">All Toys</h3>
          <small className="text-secondary">
            Showing {filteredToys.length} of {toys.length} {toys.length === 1 ? "item" : "items"} (newest first)
          </small>
        </div>
        <div
          className="position-relative"
          style={{ minWidth: 280, maxWidth: 520, width: "100%" }}
        >
          {/* Search Icon */}
          <span
            className="position-absolute top-50 start-0 translate-middle-y ps-3 text-secondary"
            style={{ pointerEvents: "none" }}
          >
            <FaSearch size={16} />
          </span>

          <input
            type="text"
            placeholder="Search by name, category, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control ps-5 py-2 rounded-pill shadow-sm"
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "#0a0a0a",
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
            }}
            aria-label="Search toys"
          />

          {searchQuery && (
            <button
              className="btn btn-sm btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

      </div>

      {/* Table */}
      <div
        className="rounded-3 border"
        style={{ borderColor: "#e2e8f0", overflow: "hidden" }}
      >
        <div className="overflow-auto" style={{ maxHeight: "70vh" }}>
          <table className="table m-0 align-middle">
            <thead
              className="sticky-top"
              style={{ top: 0, zIndex: 2, background: "#0f172a", color: "#fff" }}
            >
              <tr>
                <th style={{ width: 64 }}>No</th>
                <th style={{ width: 120 }}>Image</th>
                <th>Name</th>
                <th style={{ width: 120 }}>Price</th>
                <th style={{ width: 160 }}>Category</th>
                <th style={{ width: 160 }}>Brand</th>
                <th>Description</th>
                <th style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ background: "#f8fafc" }}>
              {filteredToys.length > 0 ? (
                filteredToys.map((toy, index) => (
                  <tr
                    key={toy._id || toy.id || index}
                    className="border-bottom"
                    style={{ borderColor: "#e2e8f0" }}
                  >
                    <td className="text-secondary">{index + 1}</td>
                    <td>
                      <div
                        className="rounded border bg-white overflow-hidden position-relative"
                        style={{
                          width: 88,
                          aspectRatio: "1 / 1",
                          borderColor: "#e2e8f0",
                        }}
                      >
                        {toy.image ? (
                          <img
                            src={toy.image}
                            alt={toy.name || "Toy"}
                            className="w-100 h-100"
                            style={{ objectFit: "cover", transition: "transform .3s ease" }}
                            loading="lazy"
                            width={176}
                            height={176}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/placeholder.png";
                              e.currentTarget.style.objectFit = "contain";
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                          />
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-secondary small">
                            No image
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="fw-semibold text-dark">{toy.name}</td>
                    <td className="text-success fw-bold">₹{Number(toy.price).toLocaleString("en-IN")}</td>
                    <td>
                      <span className="badge rounded-pill text-bg-light border" style={{ borderColor: "#cbd5e1" }}>
                        {toy.category || "—"}
                      </span>
                    </td>
                    <td>
                      <span className="badge rounded-pill text-bg-secondary">
                        {toy.brand || "—"}
                      </span>
                    </td>
                    <td>
                      <div
                        className="text-secondary"
                        style={{
                          maxWidth: 360,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                        title={toy.description}
                      >
                        {toy.description}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => handleUpdate(toy._id)}
                          className="btn btn-sm text-white"
                          style={{
                            background:
                              "linear-gradient(90deg, rgba(234,179,8,1) 0%, rgba(245,158,11,1) 100%)",
                          }}
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(toy._id)}
                          className="btn btn-sm text-white"
                          style={{
                            background:
                              "linear-gradient(90deg, rgba(239,68,68,1) 0%, rgba(185,28,28,1) 100%)",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-secondary py-4">
                    No toys found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer bar */}
        <div
          className="d-flex justify-content-between align-items-center px-3 py-2"
          style={{ background: "#0f172a" }}
        >
          <small className="text-white-50">
            Updated view — hover images to zoom. Newest products appear first.
          </small>
          <button
            className="btn btn-sm btn-outline-light"
            onClick={fetchToys}
            title="Refresh list"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllToys;
