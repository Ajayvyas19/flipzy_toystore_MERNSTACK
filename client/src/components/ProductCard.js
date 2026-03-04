import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useCart } from "../components/CartContext";

const API_BASE = "http://localhost:5000";
const PLACEHOLDER = "https://via.placeholder.com/400x400?text=No+Image";

export default function ProductCard({
  _id,
  name,
  price,
  image,
  description,
  isNew = false,
}) {
  const { addToCart } = useCart();
  const location = useLocation();

  // Current user (from storage)
  const user =
    useMemo(
      () =>
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(sessionStorage.getItem("user")),
      []
    ) || null;

  const isAdmin = user?.role === "admin";

  // Normalize image URL
  const imgSrc = useMemo(() => {
    if (!image) return PLACEHOLDER;
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    if (image.startsWith("/")) return `${API_BASE}${image}`;
    return `${API_BASE}/${image}`;
  }, [image]);

  const handleAddToCart = () => {
    if (isAdmin) return;
    addToCart({ id: _id, name, price, image: imgSrc });
    alert(`${name} added to cart!`);
  };

  return (
    <div
      className="
        group flex flex-col m-3 rounded-2xl overflow-hidden
        bg-[#0f0f0f] border border-[#1a1a1a]
        shadow-[0_8px_22px_rgba(0,0,0,0.5)]
        hover:shadow-[0_12px_30px_rgba(0,0,0,0.65)]
        transition-all duration-300
        focus-within:ring-1 focus-within:ring-white/20
      "
      tabIndex={0}
    >
      {/* Image header */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <img
          src={imgSrc}
          alt={name}
          className="w-full h-full object-contain bg-white transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PLACEHOLDER;
            e.currentTarget.style.objectFit = "contain";
            e.currentTarget.style.background = "#ffffff";
          }}
        />

        {isNew && (
          <span
            className="
              absolute top-3 left-3
              bg-white/90 text-black text-[11px] tracking-wide
              font-bold px-3 py-1 rounded-full shadow-sm
              border border-black/20
            "
          >
            NEW
          </span>
        )}
        {/* Price tag */}
        <div
          className="
            absolute bottom-3 right-3
            bg-black/80 text-white font-semibold
            px-3 py-1 rounded-full border border-white/20
            shadow
          "
        >
          ₹{Number(price).toLocaleString("en-IN")}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4">
        <h4
          className="
            text-[1.05rem] font-semibold text-white
            leading-snug line-clamp-2
            group-hover:text-gray-200 transition-colors
          "
          title={name}
        >
          {name}
        </h4>

        <p
          className="
            text-[0.9rem] text-gray-400 leading-relaxed
            line-clamp-2
          "
        >
          {description}
        </p>

        {location.pathname !== "/checkout" && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-gray-500">Flipzy Choice</span>

            <button
              onClick={handleAddToCart}
              disabled={isAdmin}
              title={isAdmin ? "Admins cannot buy products" : "Add to cart"}
              className={`
                px-4 py-2 rounded-xl font-semibold text-sm
                border transition-all duration-200
                ${
                  isAdmin
                    ? "bg-[#1c1c1c] text-gray-500 border-gray-700 cursor-not-allowed"
                    : "bg-white text-black border border-white/20 hover:bg-black hover:text-white hover:border-white/40 active:scale-[0.98]"
                }
              `}
            >
              Add to Cart
            </button>
          </div>
        )}

        {isAdmin && (
          <p className="text-[11px] text-gray-400 mt-1">
            Admin accounts cannot purchase items.
          </p>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="h-[1px] w-full bg-white/10 group-hover:bg-white/20 transition-all duration-300" />
    </div>
  );
}
