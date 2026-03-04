const express = require("express");
const { body, validationResult } = require("express-validator");
const { register, login, logout } = require("../controllers/authController");

const router = express.Router();

// Centralized validation error handler
const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
    });
  },
];

// Custom password validator: min length, at least 1 letter and 1 number
const strongPassword = body("password")
  .isLength({ min: 6 })
  .withMessage("❌ Password must be at least 6 characters long")
  .matches(/[A-Za-z]/)
  .withMessage("❌ Password must contain at least one letter")
  .matches(/\d/)
  .withMessage("❌ Password must contain at least one number");

// Register
router.post(
  "/register",
  validate([
    body("name")
      .trim()
      .notEmpty()
      .withMessage("❌ Name is required")
      .isLength({ min: 3, max: 50 })
      .withMessage("❌ Name must be 3 characters long")
      .matches(/^[A-Za-z0-9 _.-]+$/)
      .withMessage("❌ Name contains invalid characters"),
    body("email")
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage("❌ Please provide a valid email"),
    strongPassword,
  ]),
  register
);

// Login
router.post(
  "/login",
  validate([
    body("email")
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage("❌ Please provide a valid email"),
    body("password")
      .notEmpty()
      .withMessage("❌ Password is required"),
  ]),
  login
);

// Logout
router.post("/logout", logout);

module.exports = router;
