const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const Chatkit = require('@pusher/chatkit-server')

const app = express();

const chatkit = new Chatkit.default({
    instanceLocator: 'v1:us1:fe088103-8b4d-4e06-a93c-4d2fb3f963be',
    key: 'd6b63c39-9c58-459d-a34b-a8d39eb6124d:l8I+uX85fbJCwMZVSrlyE4z2f7ckYbgbirHv5pfhDgE='
})

app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());
app.use(cors());

app.post('/', (req, res) => {
    const { username } = req.body;
    let now = new Date();
    now.setMinutes(now.getMinutes() + 1)
    now = new Date(now);
    console.log(now)
    let userid;
    if (username === 'guido') {
        userid = 'guido'
    } else {
        const rand = Math.floor(Math.random() * 500) + 6000;
        userid = `${username}${rand}`
    }
    chatkit.createUser({
        name: userid,
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
})

const PORT = 3000;
app.listen(PORT, err => {
    if (err) {
        console.log(err);
    } else {
        console.log(`RUnnin on port ${PORT}`);
    }
});


