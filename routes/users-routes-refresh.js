const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const checkAuth = require('../middleware/check-auth');
const checkAutho = require('../middleware/check-autho');

const usersControllers = require('../controllers/users-controller');

router.use(checkAuth);

router.post('/refresh', usersControllers.loginRefresh);

module.exports = router;
