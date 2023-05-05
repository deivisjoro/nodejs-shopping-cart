const router = require('express').Router();

const productsController = require('../../controllers/default/products.controller');

router.get('/', productsController.showAll);
router.get('/:category', productsController.showByCategory);
router.get('/:category/:product', productsController.showProduct);

module.exports = router;