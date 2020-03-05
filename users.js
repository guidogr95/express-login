const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const chatRoutes = require('./routes/chat-routes');

const app = express();

app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    next();
});
app.use(cors());

app.use('/chat/users', chatRoutes);


const PORT = 3000;
app.listen(PORT, err => {
    if (err) {
        console.log(err);
    } else {
        console.log(`RUnnin on port ${PORT}`);
    }
});


