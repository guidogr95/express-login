const express = require('express');
const router = express.Router();
const checkAutho = require('../middleware/check-autho');

const usersControllers = require('../controllers/users-controller');

router.use(checkAutho);

router.post('/', usersControllers.chatUsers);

module.exports = router;
