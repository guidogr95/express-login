const express = require('express');
const router = express.Router();
const { check } = require('express-validator')
const checkAuth = require('../middleware/check-auth');
const placesControllers = require('../controllers/places-controller');

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);
//define middleware for route protection before the protected routes and after free routes
router.use(checkAuth);

router.post('/', 
    [
    check('title').not().isEmpty(),
    check('description').isLength({min: 5}),
    check('address').not().isEmpty()
    ],
    placesControllers.createPlace);

router.patch('/:pid', 
    [
    check('title').not().isEmpty(),
    check('description').isLength({min:5})
    ],
    placesControllers.updatePlace);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
