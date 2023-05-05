const router = require('express').Router();

const categoriesController = require('../../controllers/admin/categories.admin.controller');

router.get('/', categoriesController.index);
router.get('/add', categoriesController.addForm);
router.post('/add', categoriesController.addSave);
router.get('/edit/:id', categoriesController.editForm);
router.post('/edit/:id', categoriesController.editSave);
router.get('/delete/:id', categoriesController.delete);

module.exports = router;