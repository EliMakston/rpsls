const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const PORT = 4000;

app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(express.static('public'));

class User {
    constructor(id) {
        this._id = id;
        this.choice = undefined;
        this.hasChosen = false;
    }
};

const userList = [];

app.listen(PORT, () => {
    console.log(`Now listening on port ${PORT}`);
});

app.post('/newUser', (req, res, next) => {
    const newUser = new User(userList.length);
    userList.push(newUser);
    console.log(userList);
    res.status(201).send(userList[userList.length - 1]);
});

app.post('/choice', (req, res, next) => {
    const userId = req.body.userId;
    const choice = req.body.choice;
})

app.get('/', (req, res, next) => {
    res.sendFile('client.html', {root: __dirname });
});