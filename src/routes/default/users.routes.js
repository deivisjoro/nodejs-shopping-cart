const router = require('express').Router();

const usersController = require('../../controllers/default/users.controller');

router.get('/register', usersController.register);
router.post('/register', usersController.registerSave);
router.get('/login', usersController.login);
router.post('/login', usersController.loginSave);
router.get('/logout', usersController.logout);

module.exports = router;