const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const checkAuth = require('../middleware/check-auth');
const checkAutho = require('../middleware/check-autho');

const usersControllers = require('../controllers/users-controller');

router.post('/', usersControllers.login);

router.post('/signup', 
    [
    check('name').not().isEmpty(),
    check('password').isLength({min:5}),
    check('email').normalizeEmail().isEmail()
    ],
    usersControllers.signUp);

router.use(checkAutho);

router.post('/login', usersControllers.login);

router.use(checkAuth);

router.post('/refresh', usersControllers.loginRefresh);

module.exports = router;
