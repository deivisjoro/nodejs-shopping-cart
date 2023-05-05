const router = require('express').Router();

const pagesController = require('../../controllers/admin/pages.admin.controller');

router.get('/', pagesController.index);
router.get('/add', pagesController.addForm);
router.post('/add', pagesController.addSave);
router.post('/reorder', pagesController.reorder);
router.get('/edit/:id', pagesController.editForm);
router.post('/edit/:id', pagesController.editSave);
router.get('/delete/:id', pagesController.delete);

module.exports = router;