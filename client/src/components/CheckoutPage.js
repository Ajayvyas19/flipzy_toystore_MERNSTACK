  import React, { useState } from "react";
  import { useCart } from "../components/CartContext";
  import axios from "axios";
  import jsPDF from "jspdf";
  import autoTable from "jspdf-autotable";

  export default function CheckoutPage() {
    const { cart, removeFromCart, clearCart, addToCart } = useCart();
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [invoiceId, setInvoiceId] = useState("");
    const [orderId, setOrderId] = useState("");
    const [orderDetails, setOrderDetails] = useState({
      customerName: "",
      email: "",
      phone: "",
      payment: "COD",
      shipping: { address: "", city: "", state: "", zip: "", country: "" },
      products: [],
    });

    const inputBox = "bg-gray-800 text-white rounded px-3 py-2 w-full";
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const increaseQuantity = (item) => addToCart(item, 1);
    const decreaseQuantity = (item) => {
      if (item.quantity > 1) addToCart(item, -1);
      else removeFromCart(item.id);
    };

    const handleBuyNow = (items) => {
      setOrderDetails({ ...orderDetails, products: items });
      setOrderModalOpen(true);
    };

    const handleOrderSubmit = async (e) => {
      e.preventDefault();
      try {
        const newInvoiceId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
        const newOrderId = `#${Math.floor(100000 + Math.random() * 900000)}`;
        setInvoiceId(newInvoiceId);
        setOrderId(newOrderId);

        const orderData = {
          invoiceId: newInvoiceId,
          orderId: newOrderId,
          customerName: orderDetails.customerName,
          email: orderDetails.email,
          phone: orderDetails.phone,
          products: orderDetails.products.map(p => ({
            name: p.name,
            price: p.price,
            quantity: p.quantity,
            img: p.image || ""
          })),
          payment: orderDetails.payment,
          shipping: orderDetails.shipping,
        };

        const response = await axios.post("http://localhost:5000/api/orders", orderData, {
    withCredentials: true, 
  });

        console.log("Order saved:", response.data);
        setOrderSuccess(true);
        setOrderModalOpen(false);
        clearCart(); 

      } catch (error) {
        console.error("Error placing order:", error.response?.data || error.message);
        alert("❌ Failed to place order. Please try again.");
      }
    };

    const downloadInvoice = () => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Flipzy Invoice", 14, 20);
      doc.setFontSize(12);
      doc.text(`Invoice ID: ${invoiceId}`, 14, 30);
      doc.text(`Order ID: ${orderId}`, 14, 36);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 42);
      doc.text(`Payment: ${orderDetails.payment}`, 14, 48);
      doc.text("Bill To:", 14, 60);
      doc.text(orderDetails.customerName, 14, 66);
      doc.text(`${orderDetails.shipping.address}, ${orderDetails.shipping.city}`, 14, 72);
      doc.text(`Phone: ${orderDetails.phone}`, 14, 78);
      doc.text(`Email: ${orderDetails.email}`, 14, 84);

      const tableBody = orderDetails.products.map(p => [
        p.quantity,
        p.name,
        `Rs${p.price}`,
        `Rs${p.price * p.quantity}`
      ]);

      const subtotal = orderDetails.products.reduce((sum, p) => sum + p.price * p.quantity, 0);

      autoTable(doc, {
        startY: 95,
        head: [["Qty", "Product", "Unit Price", "Amount"]],
        body: [
          ...tableBody,
          ["", "Subtotal", "", `Rs${subtotal}`],
          ["", "Shipping", "", "Rs10"],
          ["", "Total", "", `Rs${subtotal + 10}`],
        ],
      });

      doc.save(`invoice_${orderId}.pdf`);
    };

    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 py-10 px-4 md:px-10 mt-5">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">🛒 Checkout</h2>

        {cart.length === 0 ? (
          <p className="text-center text-gray-400 text-lg">Your cart is empty.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cart.map(item => (
                <div key={item.id} className="bg-gray-800 shadow-lg rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 hover:shadow-2xl transition-shadow duration-300">
                  <img src={item.image || "https://via.placeholder.com/150"} alt={item.name} className="w-32 h-32 object-cover rounded-lg border border-gray-700" />
                  <div className="flex-1 flex flex-col justify-between h-full">
                    <div>
                      <h4 className="text-xl font-semibold text-white">{item.name}</h4>
                      <p className="text-gray-300 mt-1">₹{item.price} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={() => decreaseQuantity(item)} className="px-3 py-1 bg-red-600 rounded hover:bg-red-700">-</button>
                      <span className="text-white">{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item)} className="px-3 py-1 bg-green-600 rounded hover:bg-green-700">+</button>
                      <button onClick={() => removeFromCart(item.id)} className="ml-auto px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col md:flex-row justify-between items-center bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-white">Total: ₹{total}</h3>
              <div className="flex gap-4 mt-4 md:mt-0">
                <button onClick={() => handleBuyNow(cart)} className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700">Buy Now</button>
                <button onClick={clearCart} className="bg-red-600 px-6 py-2 rounded hover:bg-red-700">Clear Cart</button>
              </div>
            </div>
          </>
        )}

        {orderModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-2 sm:px-4">
            <div className="bg-[#0F0F1A] text-white rounded-xl shadow-xl w-full max-w-3xl p-4 sm:p-6 overflow-auto max-h-[90vh]">
              <h5 className="text-lg sm:text-xl font-bold mb-4">Order Form</h5>
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                {orderDetails.products.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="text" value={item.name} readOnly className={inputBox} />
                    <input type="text" value={`₹${item.price}`} readOnly className={inputBox} />
                    <input type="number" min="1" value={item.quantity} readOnly className={inputBox} />
                  </div>
                ))}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  <input type="text" placeholder="Full Name" value={orderDetails.customerName} onChange={(e) => setOrderDetails({...orderDetails, customerName: e.target.value})} className={inputBox}/>
                  <input type="email" placeholder="Email" value={orderDetails.email} onChange={(e) => setOrderDetails({...orderDetails, email: e.target.value})} className={inputBox}/>
                  <input type="tel" placeholder="Phone" value={orderDetails.phone} onChange={(e) => setOrderDetails({...orderDetails, phone: e.target.value})} className={inputBox}/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {["address", "city", "state", "country"].map((field) => (
                    <input key={field} type="text" placeholder={field.toUpperCase()} value={orderDetails.shipping[field]} onChange={(e) => setOrderDetails({...orderDetails, shipping: {...orderDetails.shipping, [field]: e.target.value}})} className={inputBox}/>
                  ))}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button type="submit" className="bg-blue-600 px-6 py-2 rounded hover:bg-green-500">Place Order</button>
                  <button type="button" onClick={() => setOrderModalOpen(false)} className="bg-gray-700 px-6 py-2 rounded hover:bg-red-600">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {orderSuccess && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6">
    <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-3xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Flipzy Invoice</h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-xs sm:text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Qty</th>
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-right">Unit Price</th>
              <th className="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.products.map((item, index) => (
              <tr key={index}>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">{item.name}</td>
                <td className="p-2 text-right">₹{item.price}</td>
                <td className="p-2 text-right">₹{item.price * item.quantity}</td>
              </tr>
            ))}

            {/* ✅ Calculate subtotal from orderDetails instead of cart */}
            {(() => {
              const orderSubtotal = orderDetails.products.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );
              return (
                <>
                  <tr>
                    <td colSpan="3" className="p-2 text-right font-semibold">
                      Subtotal
                    </td>
                    <td className="p-2 text-right">₹{orderSubtotal}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="p-2 text-right font-semibold">
                      Shipping
                    </td>
                    <td className="p-2 text-right">₹10</td>
                  </tr>
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan="3" className="p-2 text-right uppercase">
                      Total
                    </td>
                    <td className="p-2 text-right text-green-600">
                      ₹{orderSubtotal + 10}
                    </td>
                  </tr>
                </>
              );
            })()}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={() => setOrderSuccess(false)}
          className="bg-gray-500 px-6 py-2 rounded hover:bg-gray-600"
        >
          Close
        </button>
        <button
          onClick={downloadInvoice}
          className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
        >
          Download Invoice
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    );
  }
