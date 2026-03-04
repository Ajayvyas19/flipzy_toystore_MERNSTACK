const mongoose = require("mongoose");

const productSubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" }, // normalized to "image"
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    invoiceId: String,
    orderId: String,
    customerName: String,
    email: String,
    phone: String,
    products: { type: [productSubSchema], default: [] },
    payment: String,
    shipping: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String },
      country: { type: String, required: true },
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
    },
    cancelledAt: { type: Date }, // audit field
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
