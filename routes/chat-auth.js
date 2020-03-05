const express = require('express');
const router = express.Router();

const usersControllers = require('../controllers/users-controller');

router.post('/', usersControllers.chatAuth);

module.exports = router;
