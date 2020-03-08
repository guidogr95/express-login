const bcrypt = require('bcryptjs');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Chatkit = require('@pusher/chatkit-server')

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

const chatUsers = (req,res,next) => {
    const chatkit = new Chatkit.default({
        instanceLocator: 'v1:us1:fe088103-8b4d-4e06-a93c-4d2fb3f963be',
        key: 'd6b63c39-9c58-459d-a34b-a8d39eb6124d:l8I+uX85fbJCwMZVSrlyE4z2f7ckYbgbirHv5pfhDgE='
    })
    const { username } = req.body;
    let now = new Date();
    now.setMinutes(now.getMinutes() + 1)
    now = new Date(now);
    let userid;
    if (username === 'guido') {
        userid = 'guido'
    } else {
        const rand = Math.floor(Math.random() * 500) + 6000;
        userid = `${now} ${username}${rand}`
    }
    chatkit.createUser({
        name: username,
        id: userid,
        exp: now
    }).then(() => res.status(201).json({ userId: userid }))
    .catch(error => {
        if(error.error === 'services/chatkit/user_already_exists') {
            res.status(200).json({ userId: userid });
        } else {
            res.status(error.status).json(error);
        }
    })
}

const chatAuth = (req, res, next) => {
    const chatkit = new Chatkit.default({
        instanceLocator: 'v1:us1:fe088103-8b4d-4e06-a93c-4d2fb3f963be',
        key: 'd6b63c39-9c58-459d-a34b-a8d39eb6124d:l8I+uX85fbJCwMZVSrlyE4z2f7ckYbgbirHv5pfhDgE='
    })
    const authData = chatkit.authenticate({ 
        userId: req.query.user_id
    }); 
    
    res.status(authData.status) 
        .set(authData.headers) 
        .send(authData.body); 
}


exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
exports.loginRefresh = loginRefresh;
exports.chatUsers = chatUsers;
exports.chatAuth = chatAuth;