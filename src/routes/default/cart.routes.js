const router = require('express').Router();

const auth   = require('../../config/auth');

const cartController = require('../../controllers/default/cart.controller');

router.get('/add/:producto', auth.isUser, cartController.add);
router.get('/checkout', cartController.checkout);
router.get('/update/:product', auth.isUser, cartController.update);
router.get('/clear', auth.isUser, cartController.clear);
router.get('/buynow', auth.isUser, cartController.buynow);

module.exports = router;