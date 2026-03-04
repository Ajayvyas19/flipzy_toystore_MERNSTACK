import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

export default function UserDashboard() {
  const [toys, setToys] = useState([]);
  const [filteredToys, setFilteredToys] = useState([]);
  const [search, setSearch] = useState("");
  const [currentBanner, setCurrentBanner] = useState(0);
  const [timeLeft, setTimeLeft] = useState(86400);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const banners = [
    {
      img: "https://img.freepik.com/premium-photo/banner-ideas…s-activities-black-friday_1020495-3213.jpg",
      title: "Mega Sale",
      desc: "Up to 70% off on Electronics & Fashion",
    },
    {
      img: "https://img.freepik.com/premium-photo/toy-train-wi…-that-says-toy-train-top_960782-208311.jpg",
      title: "Fashion Fiesta",
      desc: "Flat 50% Off on Top Brands!",
    },
    {
      img: "https://img.freepik.com/premium-photo/close-up-photo-preschool-class-toys_635940-582.jpg",
      title: "Gadget Carnival",
      desc: "Exciting offers on latest tech!",
    },
  ];

  const addToCart = (toy) => {
    setCart((prev) => {
      const exist = prev.find((item) => item.id === toy._id);
      if (exist) {
        return prev.map((item) =>
          item.id === toy._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prev,
          { id: toy._id, name: toy.name, price: toy.price, image: toy.image, quantity: 1 },
        ];
      }
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => item.id !== id));
  const clearCart = () => setCart([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/toys")
      .then((res) => {
        setToys(res.data);
        setFilteredToys(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentBanner((prev) => (prev + 1) % banners.length),
      4000
    );
    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    const countdown = setInterval(
      () => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)),
      1000
    );
    return () => clearInterval(countdown);
  }, []);

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);

    if (!value) return setFilteredToys(toys);

    setFilteredToys(
      toys.filter((toy) =>
        ["name", "category", "brand", "price"].some((key) =>
          toy[key]?.toString().toLowerCase().includes(value)
        )
      )
    );
  };

  return (
    <div className="bg-[#161621] font-sans text-white min-h-screen ">
      <section className="relative h-[400px] overflow-hidden mt-[80px]">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute w-full h-full transition-opacity duration-1000 ${
              index === currentBanner ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={banner.img} alt={banner.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center px-4">
              <h2 className="text-4xl font-extrabold text-yellow-400 drop-shadow-lg">
                {banner.title}
              </h2>
              <p className="mt-2 text-lg text-gray-200">{banner.desc}</p>
              <button className="mt-4 bg-yellow-400 text-black px-6 py-2 rounded-full hover:bg-yellow-500 shadow-md">
                Shop Now
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="px-6 lg:px-12 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold">🛒 Order Now</h2>
          <span className="bg-gray-800 text-yellow-400 px-4 py-2 rounded-full font-semibold">
            Ends in {formatTime(timeLeft)}
          </span>
          <div className="position-relative w-100" style={{ maxWidth: "500px" }}>
            <i
              className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
              style={{ fontSize: "1.2rem" }}
            ></i>
            <input
              type="text"
              placeholder="Search toys..."
              value={search}
              onChange={handleSearch}
              className="form-control ps-5 py-2 rounded-pill shadow-sm border border-2 border-primary "
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredToys.length > 0 ? (
            filteredToys.map((toy) => (
              <ProductCard key={toy._id} {...toy} addToCart={() => addToCart(toy)} />
            ))
          ) : (
            <p className="text-gray-400">No toys found.</p>
          )}
        </div>
      </section>

      {cartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white text-black rounded-lg shadow-xl w-full max-w-lg p-4">
            <h2 className="text-xl font-bold mb-4">Your Cart</h2>
            {cart.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h4>{item.name}</h4>
                        <p>₹{item.price} × {item.quantity}</p>
                      </div>
                    </div>
                    <button className="text-red-500" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </button>
                  </div>
                ))}
                <div className="flex justify-between mt-4 font-bold">
                  <span>Total:</span>
                  <span>₹{cart.reduce((sum, i) => sum + i.price * i.quantity, 0)}</span>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={clearCart}
                    className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Clear
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <header className="fixed top-0 left-0 w-full bg-[#0F0F1A] z-50 flex justify-between items-center px-6 py-4 shadow">
        <h1 className="text-2xl font-bold text-yellow-400">Flipzy</h1>
        <div className="relative cursor-pointer" onClick={() => setCartOpen(!cartOpen)}>
          <i className="bi bi-cart-fill text-white text-2xl"></i>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {cart.length}
            </span>
          )}
        </div>
      </header>
    </div>
  );
}
