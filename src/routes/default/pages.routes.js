const router = require('express').Router();

const pagesController = require('../../controllers/default/pages.controller');

router.get('/', pagesController.home);
router.get('/:slug', pagesController.page);

module.exports = router;