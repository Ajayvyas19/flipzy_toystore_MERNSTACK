const express = require('express');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

const toyController = require('../controllers/toyController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Centralized validation error handler
const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
    });
  },
];

// Common rules
const nameRule = body('name')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('Name must be 2-100 characters long');

const priceRule = body('price')
  .optional({ checkFalsy: true })
  .isFloat({ min: 0 })
  .withMessage('Price must be a non-negative number')
  .toFloat();

const descriptionRule = body('description')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ min: 10, max: 2000 })
  .withMessage('Description must be 10-2000 characters long');

const brandRule = body('brand')
  .optional({ nullable: true })
  .trim()
  .isLength({ max: 100 })
  .withMessage('Brand must be at most 100 characters');

const categoryRule = body('category')
  .optional({ checkFalsy: true })
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('Category must be 2-100 characters long');

const idParamRule = param('id').isMongoId().withMessage('Invalid toy id');

// Create: require all main fields (except brand) if no file-driven image provided
const createRules = [
  body('name').exists().withMessage('Name is required'),
  body('price').exists().withMessage('Price is required'),
  body('description').exists().withMessage('Description is required'),
  body('category').exists().withMessage('Category is required'),
  // image string is optional because file can supply it; controller will enforce presence of either
  nameRule,
  priceRule,
  descriptionRule,
  brandRule,
  categoryRule,
];

// Update: all fields optional but validated if present
const updateRules = [
  idParamRule,
  nameRule,
  priceRule,
  descriptionRule,
  brandRule,
  categoryRule,
];

// Create with optional image file (multipart or JSON)
router.post(
  '/',
  verifyToken,
  isAdmin,
  upload.single('imageFile'),
  validate(createRules),
  toyController.createToy
);

// Public listings
router.get('/', toyController.getToys);
router.get(
  '/:id',
  validate([idParamRule]),
  toyController.getToyById
);

// Update with optional image file
router.put(
  '/:id',
  verifyToken,
  isAdmin,
  upload.single('imageFile'),
  validate(updateRules),
  toyController.updateToy
);

// Delete
router.delete(
  '/:id',
  verifyToken,
  isAdmin,
  validate([idParamRule]),
  toyController.deleteToy
);

module.exports = router;
