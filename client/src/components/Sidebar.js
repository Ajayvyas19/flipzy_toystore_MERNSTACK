import React from "react";

export default function Sidebar({ setActivePage }) {
  const menuItems = [
    { key: "all", label: "🛒 All Toys" },
    { key: "add", label: "➕ Add Toy" },
    { key: "order", label: "📦 Orders" },
  ];

  return (
    <div className="text-white p-6 h-full">
      <h2 className="text-cyan-400 text-xl font-bold mb-6">Admin Menu</h2>

      <ul className="space-y-3">
        {menuItems.map((item) => (
          <li
            key={item.key}
            onClick={() => setActivePage(item.key)}
            className="cursor-pointer px-4 py-2 rounded-lg border border-gray-800 hover:bg-cyan-500/20 hover:text-cyan-400 transition"
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
