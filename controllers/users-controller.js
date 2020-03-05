const bcrypt = require('bcryptjs');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch(err) {
        const error = new HttpError('Fetching users fialed, please try again later', 500);
        return next(error);
    }
    res.json({users: users.map(user => user.toObject({getters:true}))});
};

const signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid data', 422));
    }
    const { name, email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({email: email});
    } catch(err) {
        const error = new HttpError('Signing up failed please try again later', 500);
        return next(error);
    }
    if (existingUser) {
        const error = new HttpError('user exists already, please login instrad',422);
        return next(error);
    }
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch(err) {
        const error = new HttpError('Could not create user please try again',500);
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        password: hashedPassword,
        places: []
    });
    try {
        await createdUser.save();
    } catch(err) {
        const error = new HttpError('Signing up failed, please try again', 500);
        return next(error);
    }
    let token;
    try {
        token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, 'supersecret-dontshare', {expiresIn: '1h'});
    } catch(err) {
        const error = new HttpError('Signing up failed, please try again', 500);
        return next(error);
    }

    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    const { email, password } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({email: email});
    } catch(err) {
        
        const error = new HttpError('Logging in failed please try again later', 500);
        return next(error);
    }
    
    if (!existingUser) {
        const error = new HttpError('Invalid credentials, could not log you in', 401);
        return next(error);
    }
    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        
        const error = new HttpError('Could not log you in, please check your credentials and try again', 500);
        return next(error);
    }
    if (!isValidPassword) {
        
        const error = new HttpError('Could not log you in, please check your credentials and try again', 500);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, 'supersecret-dontshare', {expiresIn: '1h'});
    } catch(err) {
        
        const error = new HttpError('Signing up failed, please try again', 500);
        return next(error);0
    }
    
    res.json({ userId: existingUser.id, email: existingUser.email, token: token });
};

const loginRefresh = async (req, res, next) => {
    const { email } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({email: email});
    } catch(err) {
        const error = new HttpError('Refreshing failed', 500);
        return next(error);
    }
    
    if (!existingUser) {
        const error = new HttpError('User does not exist anymore', 401);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, 'supersecret-dontshare', {expiresIn: '1h'});
    } catch(err) {   
        const error = new HttpError('Refrshing failed, please log in again', 500);
        return next(error);0
    }
    res.json({ userId: existingUser.id, email: existingUser.email, token: token });
};



exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
exports.loginRefresh = loginRefresh;