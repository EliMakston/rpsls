const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const PORT = 3000;

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

class Request {
    constructor(id, host, opponent) {
        this.host = host;
        this.opponent = opponent;
        this.id = id;
    }
}

function checkMatches(req, res, next) {
    const newHost = req.body.host;
    const newOpponent = Number(req.body.opponent);
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
const requestList = [];

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
    const newMatch = new Match(matchList.length, req.hostID, req.opponent);
    matchList.push(newMatch);
    res.status(201).send(newMatch);
});

app.get('/matches', (req, res, next) => {
    res.status(200).send(matchList);
})

app.get('/opponentChoice/:id', (req, res, next) => {
    let opponentId;
    console.log(opponentId);
    const currentUserId = Number(req.params.id);
    for (let i = 0; i < matchList.length; i++) {
        if (matchList[i].host === currentUserId) {
            opponentId = matchList[i].opponent;
        } else if (matchList[i].opponent === currentUserId) {
            opponentId = matchList[i].host;
        }
    }
    console.log(opponentId);
    const opponentData = userList[opponentId];
    if (opponentData.choice) {
        res.status(200).send(userList[opponentId]);
    } else {
        res.status(404).send();
    }
});

app.post('/newRequest', checkMatches, (req, res, next) => {
    let newRequestID;
    if (requestList.length === 0) {
        newRequestID = 0;
    } else {
        if (requestList.length - 1 === (requestList[requestList.length-1].id)) {
            newRequestID = requestList.length;
        } else {
            for (let i = 0; i < requestList.length; i++) {
                if (requestList[i].id != i) {
                    newRequestID = i;
                    break;
                }
            }
        }
    }
    const newRequest = new Request(newRequestID, req.hostID, req.opponent);
    requestList.splice(newRequestID, 0, newRequest);
    console.log(requestList);
    res.status(201).send(newRequest);
});

app.get('/requests', (req, res, next) => {
    res.status(200).send(requestList);
});

app.get('/winOrLose/:id', (req, res, next) => {
    const playerId = Number(req.params.id);
    console.log(playerId);
    let playerChoice;
    let opponentChoice;
    let opponentId;
    for (let i = 0; i < matchList.length; i++) {
        if (matchList[i].host === playerId) {
            opponentId = matchList[i].opponent;
        } else if (matchList[i].opponent === playerId) {
            opponentId = matchList[i].host;
        }
        for (let z = 0; z < userList.length; z++) {
            if (userList[z].id === opponentId) {
                opponentChoice = userList[z].choice;
            }
            if (userList[z].id === playerId) {
                playerChoice = userList[z].choice;
            }
        }
        console.log(playerChoice);
        console.log(opponentChoice);
    }
    if (playerChoice === 'Rock') {
        if (opponentChoice === 'Scissors' || opponentChoice === 'Lizard') {
            res.status(200).send(`You won`);
        } else if (opponentChoice === 'Paper' || opponentChoice === 'Spock') {
            res.status(200).send(`You lost`);
        } else if (opponentChoice === 'Rock') {
            res.status(200).send(`You tie`);
        }
    } else if (playerChoice === 'Paper') {
        if (opponentChoice === 'Rock' || opponentChoice === 'Spock') {
            res.status(200).send(`You won`);
        } else if (opponentChoice === 'Scissors' || opponentChoice === 'Lizard') {
            res.status(200).send(`You lost`);
        } else if (opponentChoice === 'Paper') {
            res.status(200).send(`You tie`);
        }
    } else if (playerChoice === 'Scissors') {
        if (opponentChoice === 'Paper' || opponentChoice === 'Lizard') {
            res.status(200).send(`You won`);
        } else if (opponentChoice === 'Rock' || opponentChoice === 'Spock') {
            res.status(200).send(`You lost`);
        } else if (opponentChoice === 'Scissors') {
            res.status(200).send(`You tie`);
        }
    } else if (playerChoice === 'Spock') {
        if (opponentChoice === 'Scissors' || opponentChoice === 'Rock') {
            res.status(200).send(`You won`);
        } else if (opponentChoice === 'Paper' || opponentChoice === 'Lizard') {
            res.status(200).send(`You lost`);
        } else if (opponentChoice === 'Spock') {
            res.status(200).send(`You tie`);
        }
    } else if (playerChoice === 'Lizard') {
        if (opponentChoice === 'Paper' || opponentChoice === 'Spock') {
            res.status(200).send(`You won`);
        } else if (opponentChoice === 'Rock' || opponentChoice === 'Scissors') {
            res.status(200).send(`You lost`);
        } else if (opponentChoice === 'Lizard') {
            res.status(200).send(`You tie`);
        }
    } else {
        res.status(400).send(`Something failed`);
    }
});

app.delete('/requests/:Opponentid', (req, res, next) => {
    const OpponentId = Number(req.params.Opponentid);
    let index;
    for (let i = 0; i < requestList.length; i++) {
        if (requestList[i].opponent === OpponentId) {
            index = requestList.id;
        }
    }
    requestList.splice(index, 1);
    console.log(requestList);
    res.status(204).send();
});

app.get('/', (req, res, next) => {
    res.sendFile('client.html', {root: __dirname });
});