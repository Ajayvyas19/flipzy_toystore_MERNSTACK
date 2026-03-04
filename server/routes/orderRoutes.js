const express = require("express");
const {
  createOrder,
  getMyOrders,
  updateStatus,
  getAllOrders,
} = require("../controllers/orderController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, createOrder);
router.get("/my", verifyToken, getMyOrders);
router.get("/", verifyToken, isAdmin, getAllOrders);
router.patch("/:id/status", verifyToken, updateStatus);

module.exports = router;
