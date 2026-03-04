import React, { useEffect, useState } from "react";
import a1 from "../a1.jpg";
import a3 from "../a3.jpg";

export default function HomePage() {
  const slides = [
    {
      img: "https://img.freepik.com/premium-photo/set-differen…constructor-yellow-surface_114309-2039.jpg?w=1060",
      title: "Discover Premium Toys",
      desc: "High-quality, safe and fun toys for all ages.",
    },
    {
      img: a1,
      title: "Latest Gadgets",
      desc: "Smart and innovative gadgets at your fingertips.",
    },
    {
      img: a3,
      title: "Lifestyle Collection",
      desc: "Upgrade your lifestyle with premium essentials.",
    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="bg-black text-white font-sans leading-relaxed mt-5">
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden rounded-b-3xl">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.img}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center px-8">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-lg max-w-3xl mx-auto">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl mb-8 max-w-2xl">
                {slide.desc}
              </p>
            </div>
          </div>
        ))}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 w-8 rounded-full transition-all duration-500 ${
                i === current
                  ? "bg-indigo-500 w-12 shadow-md shadow-indigo-400/50"
                  : "bg-gray-400 hover:bg-gray-500"
              }`}
            ></button>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 text-center">
        <h2 className="text-4xl font-bold mb-14">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              name: "Toys",
              img: "https://www.tinyminymo.com/cdn/shop/files/Pokemon-Cosplay-Pikachu-Action-Figure-11.png?v=1741539805&width=360",
            },
            {
              name: "Electronics Toys",
              img: "https://png.pngtree.com/thumb_back/fh260/background/20230408/pngtree-robot-white-cute-robot-blue-light-background-image_2199825.jpg",
            },
            {
              name: "Remote Cars / Drones",
              img: "https://th.bing.com/th/id/OIP.ELsRG34ZHawr22iLg0LWFgHaFS?w=249&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7",
            },
          ].map((cat, i) => (
            <div
              key={i}
              className="p-8 bg-gray-900 rounded-2xl hover:bg-gray-800 transition transform hover:scale-105 cursor-pointer flex flex-col items-center shadow-md hover:shadow-xl"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="h-40 w-full object-cover rounded-lg mb-6"
              />
              <h3 className="text-2xl font-semibold">{cat.name}</h3>
              <p className="text-gray-400 mt-3">Explore the latest {cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-700 text-center px-6 rounded-t-3xl">
        <h2 className="text-4xl font-bold mb-6">🔥 Special Offer!</h2>
        <p className="mb-10 text-lg">
          Get <span className="font-semibold">30% OFF</span> on all electronics
          this week.
        </p>
        <a
          href="/offers"
          className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-900 text-lg shadow-md hover:shadow-xl transition"
        >
          Grab the Deal
        </a>
      </section>
    </div>
  );
}
