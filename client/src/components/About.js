import React from "react";

export default function About() {
  return (
    <div className="bg-black text-white min-h-screen">
      <section className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 py-20 sm:py-24 text-center">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 mt-5 drop-shadow-lg">
            About Our Store
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Bringing joy to kids with toys they’ll love, at prices parents trust.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <img
          src="https://thumbs.dreamstime.com/b/e-commerce-online-shopping-business-technology-concept-screen-e-commerce-online-shopping-business-technology-concept-screen-207950081.jpg"
          alt="Our Story"
          className="rounded-2xl shadow-xl w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
        />
        <div>
          <h2 className="text-3xl font-bold mb-4">Our Story</h2>
          <p className="text-gray-300 leading-relaxed">
            Started with a passion for creating smiles, we launched our toy
            store to bring safe, fun, and affordable toys to families everywhere.
            From classic favorites to the latest trends, we curate toys that
            spark imagination and joy.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition">
            <h2 className="text-3xl font-bold mb-3">Our Mission</h2>
            <p className="text-gray-300">
              To provide high-quality, safe, and affordable toys that inspire
              creativity and fun in every child.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition">
            <h2 className="text-3xl font-bold mb-3">Our Vision</h2>
            <p className="text-gray-300">
              To become the most trusted global toy store, loved by kids and
              parents alike.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-10">Why Choose Us?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: "🚚", title: "Fast Delivery", desc: "Quick & safe delivery." },
            { icon: "💳", title: "Secure Payment", desc: "Shop with confidence." },
            { icon: "⭐", title: "Quality Toys", desc: "Safe & durable toys." },
            { icon: "🎁", title: "Exclusive Discounts", desc: "Great deals year-round." },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 bg-gray-800 rounded-xl shadow-md hover:scale-105 hover:shadow-xl transition"
            >
              <div className="text-3xl">{item.icon}</div>
              <h3 className="text-xl font-semibold mt-4">{item.title}</h3>
              <p className="text-gray-400 mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-indigo-700 to-purple-700">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { number: "10K+", label: "Happy Customers" },
            { number: "1K+", label: "Toys Available" },
            { number: "5+", label: "Years of Service" },
          ].map((stat, i) => (
            <div key={i}>
              <h3 className="text-4xl sm:text-5xl font-bold">{stat.number}</h3>
              <p className="text-gray-200 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Explore?</h2>
        <p className="text-gray-300 mb-6 max-w-lg mx-auto">
          Discover a world of fun toys your kids will love.
        </p>
        <a
          href="/register"
          className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white px-8 py-3 rounded-full font-semibold transition"
        >
          Shop Now
        </a>
      </section>
    </div>
  );
}
