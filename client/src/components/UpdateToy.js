import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTag, FaImage, FaAlignLeft, FaFeatherAlt, FaRupeeSign } from "react-icons/fa";

const API_BASE = "http://localhost:5000";

const CATEGORY_OPTIONS = [
  "Soft Toys",
  "Action Figures",
  "Educational",
  "Puzzles",
  "Board Games",
  "Dolls",
  "Vehicles",
  "Outdoor",
  "Building Sets",
  "Plush",
  "Arts & Crafts",
  "Electronic Toys",
  "Infant & Toddler",
  "STEM",
  "Other",
];

const initialForm = {
  name: "",
  price: "",
  description: "",
  brand: "",
  category: "",
};

const UpdateToy = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [otherCategory, setOtherCategory] = useState("");
  const [file, setFile] = useState(null);
  const [serverImage, setServerImage] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  // UI state
  const [toast, setToast] = useState({ open: false, type: "info", msg: "" });
  const [errors, setErrors] = useState({}); // field -> message

  const showToast = (msg, type = "info", timeout = 1800) => {
    setToast({ open: true, type, msg });
    if (timeout) {
      setTimeout(() => setToast((t) => ({ ...t, open: false })), timeout);
    }
  };

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    const fetchToy = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/toys/${id}`);
        const data = res.data || {};
        setFormData({
          name: data.name || "",
          price: data.price?.toString?.() || "",
          description: data.description || "",
          brand: data.brand || "",
          category: data.category || "",
        });
        if (data.category && !CATEGORY_OPTIONS.includes(data.category)) {
          setFormData((prev) => ({ ...prev, category: "Other" }));
          setOtherCategory(data.category);
        }
        setServerImage(data.image || "");
        setPreview(data.image || "");
      } catch (e) {
        showToast("Failed to load toy data.", "error", 2500);
      }
    };
    fetchToy();
  }, [id]);

  const inputBase =
    "w-full p-3 rounded-lg bg-[#21262d] border transition-all outline-none";
  const okRing = "border-gray-700 focus:ring-2 focus:ring-blue-500";
  const errRing = "border-red-500 focus:ring-2 focus:ring-red-500";

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      setField("category", value);
      if (value !== "Other") setOtherCategory("");
      return;
    }
    setField(name, value);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);

    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    if (f) {
      const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/jpg",
        "image/svg+xml",
      ];
      if (!allowed.includes(f.type)) {
        showToast("Only image files allowed (jpg, png, webp, gif, svg).", "error");
        e.target.value = "";
        setFile(null);
        setPreview(serverImage || "");
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (f.size > maxSize) {
        showToast("Image must be 5MB or smaller.", "error");
        e.target.value = "";
        setFile(null);
        setPreview(serverImage || "");
        return;
      }
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(serverImage || "");
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = "Enter a valid name (min 2 chars).";
    }
    if (formData.price === "" || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      errs.price = "Enter a non-negative price.";
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errs.description = "Description must be at least 10 characters.";
    }
    const finalCategory =
      formData.category === "Other" ? otherCategory.trim() : formData.category;
    if (!finalCategory) {
      errs.category = "Please select a category.";
    }
    if (formData.category === "Other" && !otherCategory.trim()) {
      errs.otherCategory = "Enter a custom category.";
    }
    return { errs, finalCategory };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const { errs, finalCategory } = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      showToast("Fix highlighted fields.", "error", 2000);
      return;
    }

    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        showToast("Please log in to update.", "error");
        setTimeout(() => navigate("/register"), 800);
        return;
      }

      if (file) {
        const fd = new FormData();
        fd.append("name", formData.name.trim());
        fd.append("price", String(Number(formData.price) || 0));
        fd.append("description", formData.description.trim());
        fd.append("brand", formData.brand.trim() || "Generic");
        fd.append("category", finalCategory);
        fd.append("imageFile", file);

        await axios.put(`${API_BASE}/api/toys/${id}`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.put(
          `${API_BASE}/api/toys/${id}`,
          {
            name: formData.name.trim(),
            price: Number(formData.price),
            description: formData.description.trim(),
            brand: formData.brand.trim() || "Generic",
            category: finalCategory,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      showToast("✅ Toy updated successfully!", "success");
      setTimeout(() => navigate("/admin"), 600);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        showToast("Invalid/expired token. Please login again.", "error");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        setTimeout(() => navigate("/register"), 800);
      } else if (status === 403) {
        showToast("Access denied. Admins only.", "error");
      } else if (status === 400 && err.response?.data?.errors?.length) {
        // server-side validation messages
        const apiErrs = {};
        for (const e of err.response.data.errors) {
          apiErrs[e.field || "form"] = e.msg;
        }
        setErrors((prev) => ({ ...prev, ...apiErrs }));
        showToast(err.response.data.message || "Validation failed.", "error");
      } else {
        showToast(err.response?.data?.message || "Failed to update toy.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const labelCls = "block mb-1 font-medium flex items-center gap-2";
  const hint = (msg) => <small className="text-red-400">{msg}</small>;

  return (
    <div className="flex justify-center items-start py-10 px-4 bg-[#0d1117] min-h-screen mt-5">
      {/* Toast */}
      {toast.open && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-xl z-50 ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="w-full max-w-2xl bg-[#161b22] rounded-2xl shadow-2xl p-8 text-white">
        <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <FaFeatherAlt /> Update Toy
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>
                <FaFeatherAlt /> Name
              </label>
              <input
                type="text"
                name="name"
                className={`${inputBase} ${
                  errors.name ? errRing : okRing
                }`}
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
                placeholder="Enter product name"
              />
              {errors.name && hint(errors.name)}
            </div>
            <div>
              <label className={labelCls}>
                <FaRupeeSign /> Price
              </label>
              <input
                type="number"
                name="price"
                className={`${inputBase} ${
                  errors.price ? errRing : okRing
                }`}
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              {errors.price && hint(errors.price)}
            </div>
          </div>

          <div>
            <label className={labelCls}>
              <FaAlignLeft /> Description
            </label>
            <textarea
              name="description"
              rows="3"
              className={`${inputBase} ${
                errors.description ? errRing : okRing
              } resize-none`}
              value={formData.description}
              onChange={handleChange}
              maxLength={2000}
              placeholder="Describe the toy features and usage"
            ></textarea>
            <div className="flex justify-between">
              {errors.description && hint(errors.description)}
              <small className="text-gray-400">
                {formData.description.length}/2000
              </small>
            </div>
          </div>

          {/* Image chooser and preview */}
          <div>
            <label className={labelCls}>
              <FaImage /> Product Image
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`${inputBase} ${okRing}`}
                />
                <small className="text-gray-400">
                  Upload a new image to replace the existing one.
                </small>
              </div>

              {/* Fixed aspect ratio preview: 1:1 square thumbnail */}
              <div>
                <div className="rounded-lg border border-gray-700 overflow-hidden bg-[#0f1319] aspect-square">
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                      No image
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Brand and Category (dropdown with Other) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>
                <FaTag /> Brand
              </label>
              <input
                type="text"
                name="brand"
                className={`${inputBase} ${okRing}`}
                placeholder="Optional"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className={labelCls}>
                <FaTag /> Category
              </label>
              <select
                name="category"
                className={`${inputBase} ${
                  errors.category ? errRing : okRing
                }`}
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.category && hint(errors.category)}

              {formData.category === "Other" && (
                <>
                  <input
                    type="text"
                    className={`${inputBase} mt-3 ${
                      errors.otherCategory ? errRing : okRing
                    }`}
                    placeholder="Enter custom category"
                    value={otherCategory}
                    onChange={(e) => setOtherCategory(e.target.value)}
                    maxLength={50}
                  />
                  {errors.otherCategory && hint(errors.otherCategory)}
                </>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button
              type="submit"
              className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-blue-500 hover:to-pink-500"
              }`}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="px-6 py-3 rounded-xl font-semibold text-gray-300 border border-gray-600 hover:bg-gray-700 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateToy;
