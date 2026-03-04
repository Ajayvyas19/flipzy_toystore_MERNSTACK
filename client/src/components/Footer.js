import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-10 w-full">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-blue-400">Flipzy</h3>
          <p className="text-gray-400">Flipzy Ecom, Surat, India</p>
          <p className="text-gray-400">
            Email:{" "}
            <a href="mailto:store@flipzy.com" className="hover:text-blue-400 transition">
              store@flipzy.com
            </a>
          </p>
          <p className="text-gray-400">
            Phone:{" "}
            <a href="tel:+919876543210" className="hover:text-blue-400 transition">
              +91 9876543210
            </a>
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-gray-200">Quick Links</h4>
          <ul className="space-y-1">
            <li>
              <button onClick={() => alert("Privacy Policy")} className="hover:text-blue-400 transition">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => alert("Terms of Service")} className="hover:text-blue-400 transition">
                Terms of Service
              </button>
            </li>
            <li>
              <button onClick={() => alert("Contact Us")} className="hover:text-blue-400 transition">
                Contact
              </button>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-gray-200">Follow Us</h4>
          <div className="flex gap-4 mt-2">
            <a className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 transition transform hover:scale-110">
              <FaFacebookF />
            </a>
            <a className="p-2 rounded-full bg-blue-400 hover:bg-blue-300 transition transform hover:scale-110">
              <FaTwitter />
            </a>
            <a className="p-2 rounded-full bg-pink-500 hover:bg-pink-400 transition transform hover:scale-110">
              <FaInstagram />
            </a>
            <a className="p-2 rounded-full bg-blue-700 hover:bg-blue-600 transition transform hover:scale-110">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-4 pb-4 text-center text-gray-500 text-sm">
        © 2025 Flipzy. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
