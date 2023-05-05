const router = require('express').Router();

const productsController = require('../../controllers/admin/products.admin.controller');

router.get('/', productsController.index);
router.get('/add', productsController.addForm);
router.post('/add', productsController.addSave);
router.get('/edit/:id', productsController.editForm);
router.post('/edit/:id', productsController.editSave);
router.post('/gallery/:id', productsController.galleryUpload);
router.get('/delete-image/:image', productsController.deleteImageGallery);
router.get('/delete/:id', productsController.delete);

module.exports = router;