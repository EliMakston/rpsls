const express = require('express');
const app = express();
const morgan = require('morgan');

const PORT = 4000;

app.use(morgan('tiny'));

class User {
    constructor(id) {
        this._id = id;
        this.choice = undefined;
        this.hasChosen = false;
    }
}

const userList = [];

app.listen(PORT, () => {
    console.log(`Now listening on port ${PORT}`);
});

app.post('/newUser', (req, res, next) => {
    const newUser = new User(userList.length+1);
    userList.push(newUser);
    console.log(userList);
    res.status(201).send(userList[userList.length - 1]);
});