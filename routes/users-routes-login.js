const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const checkAuth = require('../middleware/check-auth');
const checkAutho = require('../middleware/check-autho');

const usersControllers = require('../controllers/users-controller');

router.post('/', usersControllers.login);

module.exports = router;
