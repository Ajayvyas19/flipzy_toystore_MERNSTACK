import React, { useState } from "react";
import Sidebar from "./Sidebar";
import AllToys from "./AllToys";
import AddToy from "./AddToy";
import Orders from "./Orders";

export default function AdminDashboardPage() {
  const [activePage, setActivePage] = useState("all");

  const renderContent = () => {
    switch (activePage) {
      case "all":
        return <AllToys />;
      case "add":
        return <AddToy />;
      case "order":
        return <Orders />;
      default:
        return <AllToys />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <main className="flex flex-1 flex-col md:flex-row pt-20">
        <aside className="w-full md:w-64 bg-gray-900 border-r border-gray-800 shadow-lg flex-shrink-0 overflow-y-auto">
          <Sidebar setActivePage={setActivePage} />
        </aside>

        <section className="flex-1 p-6 bg-black">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Welcome Back, Admin 🧑‍💻
          </h1>
          <div className="bg-gray-900 p-4 rounded-xl shadow-md min-h-[70vh]">
            {renderContent()}
          </div>
        </section>
      </main>
    </div>
  );
}
