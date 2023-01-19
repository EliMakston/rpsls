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

//TODO check if player is already in match (always false, find why)
function checkMatches(req, res, next) {
    const newHost = req.body.host;
    const newOpponent = Number(req.body.opponent);
    console.log(newHost)
    console.log(newOpponent)
    let sendMatch = true;
    for (let i = 0; i < matchList.length; i++) {
        if (newHost === matchList[i].host || newHost === matchList[i].opponent) {
            console.log(`Host in match`);
            sendMatch = false;
            res.status(400).send();
        } else if (newOpponent === matchList[i].opponent || newOpponent === matchList[i].host) {
            console.log(`Opponent in match`);
            sendMatch = false;
            res.status(400).send();
        }
    }
    if (sendMatch) {
        req.hostID = newHost;
        req.opponent = newOpponent;
        next();
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

app.post('/newMatch', checkMatches, (req, res, next) => {
    console.log(req.hostID);
    console.log(req.opponent);
    const newMatch = new Match(matchList.length, req.hostID, req.opponent);
    matchList.push(newMatch);
    console.log(matchList);
    console.log(newMatch);
    res.status(201).send(newMatch);
});

app.get('/opponentChoice/:id', (req, res, next) => {
    let opponentId;
    const currentUserId = Number(req.params.id);
    console.log(currentUserId);
    console.log(matchList);
    for (let i = 0; i < matchList.length; i++) {
        console.log(matchList[i]);
        console.log(matchList[i].host);
        if (matchList[i].host === currentUserId) {
            opponentId = matchList[i].opponent;
        }
    }
    console.log(userList[opponentId]);
    res.status(200).send(userList[opponentId]);
})

app.get('/', (req, res, next) => {
    res.sendFile('client.html', {root: __dirname });
});