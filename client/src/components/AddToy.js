import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFeatherAlt, FaImage, FaTag, FaAlignLeft, FaRupeeSign } from "react-icons/fa";

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

const AddToy = () => {
  const [formData, setFormData] = useState(initialForm);
  const [otherCategory, setOtherCategory] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({ open: false, type: "info", msg: "" });
  const [errors, setErrors] = useState({});


  const showToast = (msg, type = "info", timeout = 1800) => {
    setToast({ open: true, type, msg });
    if (timeout) setTimeout(() => setToast((t) => ({ ...t, open: false })), timeout);
  };

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const inputBase =
    "w-full p-3 rounded-lg bg-[#21262d] border transition-all outline-none";
  const okRing = "border-gray-700 focus:ring-2 focus:ring-blue-500";
  const errRing = "border-red-500 focus:ring-2 focus:ring-red-500";
  const labelCls = "block mb-1 font-medium flex items-center gap-2";
  const hint = (msg) => <small className="text-red-400">{msg}</small>;

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
    if (!f) {
      setFile(null);
      setPreview("");
      return;
    }

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/jpg",
      "image/svg+xml",
    ];
    if (!allowed.includes(f.type)) {
      showToast("Only image files are allowed (jpg, png, webp, gif, svg).", "error");
      e.target.value = "";
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (f.size > maxSize) {
      showToast("Image must be 5MB or smaller.", "error");
      e.target.value = "";
      return;
    }

    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
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
    if (!file) {
      errs.file = "Please choose an image file.";
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

  const resetForm = () => {
    setFormData(initialForm);
    setOtherCategory("");
    setFile(null);
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview("");
    setErrors({});
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (loading) return; // prevent double submit
  setErrors({});

  // Optimistic immediate feedback
  showToast("Submitting toy...", "info", 1200);

  const { errs, finalCategory } = validate();
  if (Object.keys(errs).length) {
    setErrors(errs);
    showToast("Fix highlighted fields.", "error", 2200);
    return;
  }

  setLoading(true);
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      showToast("Missing token. Please log in as admin.", "error", 2500);
      return;
    }

    const fd = new FormData();
    fd.append("name", formData.name.trim());
    fd.append("price", String(Number(formData.price) || 0));
    fd.append("description", formData.description.trim());
    fd.append("brand", formData.brand.trim() || "Generic");
    fd.append("category", finalCategory);
    fd.append("imageFile", file);

    const res = await axios.post(`${API_BASE}/api/toys`, fd, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Show success regardless of 200/201 (covers proxies returning 204)
   if (res && (res.status === 200 || res.status === 201 || res.status === 204)) {
  showToast("Toy added successfully 🎉", "success", 2000);
  setTimeout(() => {
    resetForm();
    alert("Toy added successfully 🎉");
  }, 2000);
} else {
  showToast("Toy added successfully 🎉", "success", 2000);
  setTimeout(() => {
    alert("Toy added successfully 🎉");
    resetForm();
    
  });
}

  } catch (err) {
    const status = err.response?.status;
    if (status === 401) {
      showToast("Invalid/expired token. Please login again.", "error", 2800);
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    } else if (status === 403) {
      showToast("Access denied. Admins only.", "error", 2600);
    } else if (status === 400 && err.response?.data?.errors?.length) {
      const apiErrs = {};
      for (const e of err.response.data.errors) {
        apiErrs[e.field || "form"] = e.msg;
      }
      setErrors((prev) => ({ ...prev, ...apiErrs }));
      showToast(err.response.data.message || "Validation failed.", "error", 2600);
    } else {
      showToast(err.response?.data?.message || "Failed to add toy.", "error", 2600);
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex justify-center items-start py-10 px-4 bg-[#0d1117] min-h-screen">
      {/* Toast (errors/info) */}
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
          <FaFeatherAlt /> Add New Toy
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
                className={`${inputBase} ${errors.name ? errRing : okRing}`}
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
                className={`${inputBase} ${errors.price ? errRing : okRing}`}
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
              className={`${inputBase} ${errors.description ? errRing : okRing} resize-none`}
              value={formData.description}
              onChange={handleChange}
              maxLength={2000}
              placeholder="Describe the toy features and usage"
            ></textarea>
            <div className="flex justify-between">
              {errors.description && hint(errors.description)}
              <small className="text-gray-400">{formData.description.length}/2000</small>
            </div>
          </div>

          {/* Image */}
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
                  className={`${inputBase} ${errors.file ? errRing : okRing}`}
                />
                {errors.file ? (
                  hint(errors.file)
                ) : (
                  <small className="text-gray-400">JPG, PNG, WEBP, GIF up to 5MB.</small>
                )}
              </div>
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

          {/* Brand & Category */}
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
                className={`${inputBase} ${errors.category ? errRing : okRing}`}
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

          <div className="text-center pt-2">
            <button
              type="submit"
              className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                loading
                  ? "bg-gray-600"
                  : "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-blue-500 hover:to-pink-500"
              }`}
              disabled={loading}
            >
              {loading ? "Adding..." : "✨ Add Toy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToy;
