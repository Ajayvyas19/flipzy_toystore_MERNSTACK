const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const cartController = require('../controllers/cartController');

router.post('/add', verifyToken, cartController.addToCart);
router.get('/', verifyToken, cartController.getCart);
router.post('/remove', verifyToken, cartController.removeFromCart);
router.delete('/clear', verifyToken, cartController.clearCart);

module.exports = router;
