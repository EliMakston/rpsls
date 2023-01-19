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
        this.id = id;
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
    res.status(201).send(newUser);
});

app.get('/users', (req, res, next) => {
    res.status(200).send(userList);
})

app.post('/choice', (req, res, next) => {
    console.log(req.body);
    const userId = req.body.userId;
    const choice = req.body.choice;
    userList[userId].choice = choice;
    res.status(200).send(userList[userId]);
})

app.get('/', (req, res, next) => {
    res.sendFile('client.html', {root: __dirname });
});