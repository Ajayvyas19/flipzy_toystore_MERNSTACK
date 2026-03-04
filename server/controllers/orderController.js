const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const {
      invoiceId,
      orderId,
      customerName,
      email,
      phone,
      products = [],
      payment,
      shipping,
    } = req.body;

    const normalizedProducts = products.map((p) => ({
      name: p.name,
      price: Number(p.price) || 0,
      quantity: Number(p.quantity) || 1,
      image: p.image || p.img || "", // normalize to "image"
    }));

    const newOrder = new Order({
      user: req.user.id,
      invoiceId,
      orderId,
      customerName,
      email,
      phone,
      products: normalizedProducts,
      payment,
      shipping,
      status: "Pending",
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: err.message || "Failed to create order" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Admin: fetch all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Get all orders error:", err);
    res.status(500).json({ message: "Failed to fetch all orders" });
  }
};

// Update status (admin: any order; user: only own)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Shipped", "Delivered", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const isAdmin = req.user?.role === "admin";
    const filter = isAdmin ? { _id: req.params.id } : { _id: req.params.id, user: req.user.id };

    const order = await Order.findOne(filter);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};
