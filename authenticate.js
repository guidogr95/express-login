const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const Chatkit = require('@pusher/chatkit-server')
const chatAuth = require('./routes/chat-auth');

const app = express();

app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());
app.use(cors());


app.use('/chat/authenticate', chatAuth)

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404);
    return next(error);
   });
   
   app.use((error, req, res, next) => {
       if (res.headerSent) {
           return next(error);
       }
       res.status(error.code || 500);
       res.json({message: error.message || 'An unknown error ocurred'});
   });
   

const PORT = 3000;
app.listen(PORT, err => {
    if (err) {
        console.log(err);
    } else {
        console.log(`RUnnin on port ${PORT}`);
    }
});


