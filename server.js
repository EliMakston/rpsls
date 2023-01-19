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

class Match {
    constructor(id, host, opponent) {
        this.host = host;
        this.opponent = opponent;
        this.id = id;
    }
}

const userList = [];
const matchList = [];

app.listen(PORT, () => {
    console.log(`Now listening on port ${PORT}`);
});

app.post('/newUser', (req, res, next) => {
    const newUser = new User(userList.length);
    userList.push(newUser);
    res.status(201).send(newUser);
});

app.get('/users', (req, res, next) => {
    res.status(200).send(userList);
})

app.post('/choice', (req, res, next) => {
    const userId = req.body.userId;
    const choice = req.body.choice;
    userList[userId].choice = choice;
    res.status(200).send(userList[userId]);
});

app.post('/newMatch', (req, res, next) => {
    const newMatch = new Match(matchList.length, req.body.host, Number(req.body.opponent));
    matchList.push(newMatch);
    console.log(matchList);
    res.status(201).send(newMatch);
});

app.get('/', (req, res, next) => {
    res.sendFile('client.html', {root: __dirname });
});