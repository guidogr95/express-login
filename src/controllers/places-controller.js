
const HttpError = require('../models/http-error');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Place = require('../models/place');
const User = require('../models/user');


const getPlaceById = async (req,res,next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong could not find a place', 500);
        return next(error);
    }

    if (!place) {
        return next(new HttpError('could not find a place for the provided id', 404));
    }
    res.json({place: place.toObject({ getters: true })});
};


const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let places;
    try {
        places = await Place.find({creator: userId});
    } catch (err) {
        const error = new HttpError('Something went wrong could not find a place', 500);
        return next(error);
    }
    
    if (!places || places.length === 0) {
        return next(new HttpError('could not find a place for the provided user id', 404));
    }
    res.json({ places: places.map(place => place.toObject({ getters: true })) });
};


const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid data', 422));
    }
    const { title, description, coordinates, address } = req.body;
    const userId = req.userData.userId;
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates ,
        image: 'https://media2.trover.com/T/5459955326c48d783f000450/fixedw.jpg',
        creator: userId
    });
    let user;
    try {
        user = await User.findById(userId);
    } catch(err) {
        const error = new HttpError ('Creating place failed please try again', 500);
        return next(error);
    }
    if (!user) {
        const error = new HttpError('Could not find user for provided id', 404); 
        return next(error);
    }

    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again', 500);
        return next(error);
    }

    //DUMMY_PLACES.unshift(createdPlace) for adding ass first item
    res.status(201).json({place: createdPlace});
};


const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid data', 422));
    }
    const { title, description } = req.body;
    const placeId = req.params.pid;
    
    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong could not update place', 500);
        return next(error);
    }

    if (place.creator.toString() !== req.userData.userId) {
        const error = new HttpError('You are not allowed to edit this place', 403);
        return next(error);
    }

    place.title = title;
    place.description = description;
    
    try {
        await place.save()
    } catch(err) {
        const error = new HttpError('Something went wrong, could not update place', 500);
        return next(error);
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });
}


const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        //Populate is used to describe to which field in another entity there exists a relation and then use that to update or delete
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete place', 500);
        return next(error);
    }
    if(!place) {
        const error = new HttpError('Could not find place for id', 404);
        return next(error);
    }
    if (place.creator.id !== req.userData.userId) {
        const error = new HttpError('You are not allowed to edit this place', 403);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({ session: sess });
        //pull and push automatically add or delete the related id
        place.creator.places.pull(place);
        //thanks to populate we get all the user functions and the ability to manipulate it through place.creator
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete place', 500);
        return next(error);
    }
    res.status(299).json({ message: 'Deleted place' });
}


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;