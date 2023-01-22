const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000;

app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(express.static('public'));

class User {
    constructor(id) {
        this.id = id;
        this.choice = undefined;
        this.hasChosen = false;
        this.key = undefined;
    }
    generateNewKey() {
        const keyLength = 10;
        const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
        let key = '';
        for (let i = 0; i < keyLength; i++) {
            const rand = Math.floor(Math.random() * 62);
            key += alphabet[rand];
        }
        this.key = key;
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
    newUser.generateNewKey();
    for (let i = 0; i < userList.length; i++) {
        if (newUser.key === userList[i].key) {
            newUser.generateNewKey();
            i = 0;
        }
    }
    userList.push(newUser);
    res.status(201).send(newUser);
});

app.get('/users', (req, res, next) => {
    let tempList = [];
    for (let i = 0; i < userList.length; i++) {
        const tempUser = {
            id: userList[i].id,
        }
        console.log(tempUser);
        tempList.push(tempUser);
    }
    console.log(tempList);
    res.status(200).send(tempList);
})

app.post('/choice', (req, res, next) => {
    const userId = req.body.userId;
    const choice = req.body.choice;
    const userKey = req.body.userKey;
    console.log(userKey);
    console.log(userList[userId]);
    if (userList[userId].key === userKey) {
        userList[userId].choice = choice;
        res.status(200).send(userList[userId]);
    } else {
        res.status(404).send();
    }
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
    const opponentData = {
        choice: userList[opponentId].choice
    }
    if (opponentData.choice) {
        console.log(opponentData);
        res.status(200).send(opponentData);
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
            res.status(200).send(`You won. You chose ${playerChoice}, and your opponent chose ${opponentChoice}.`);
        } else if (opponentChoice === 'Paper' || opponentChoice === 'Spock') {
            res.status(200).send(`You lost. You chose ${playerChoice}, and your opponent chose ${opponentChoice}.`);
        } else if (opponentChoice === 'Rock') {
            res.status(200).send(`You tie. You chose ${playerChoice}, and your opponent chose ${opponentChoice}.`);
        }
    } else if (playerChoice === 'Paper') {
        if (opponentChoice === 'Rock' || opponentChoice === 'Spock') {
            res.status(200).send(`You won. You chose ${playerChoice}, and your opponent chose ${opponentChoice}.`);
        } else if (opponentChoice === 'Scissors' || opponentChoice === 'Lizard') {
            res.status(200).send(`You lost. You chose ${playerChoice}, and your opponent chose ${opponentChoice}.`);
        } else if (opponentChoice === 'Paper') {
            res.status(200).send(`You tie. You chose ${playerChoice}, and your opponent chose ${opponentChoice}.`);
        }
    } else if (playerChoice === 'Scissors') {
        if (opponentChoice === 'Paper' || opponentChoice === 'Lizard') {
            res.status(200).send(`You won. You chose ${playerChoice}, and your opponent chose ${opponentChoice}.`);
        } else if (opponentChoice === 'Rock' || opponentChoice === 'Spock') {
            res.status(200).send(`You lost. You chose ${playerChoice}, and your opponent chose ${opponentChoice}.`);
        } else if (opponentChoice === 'Scissors') {
            res.status(200).send(`You tie. You chose ${playerChoice}, and your opponent chose ${opponentChoice}.`);
        }
    } else if (playerChoice === 'Spock') {
        if (opponentChoice === 'Scissors' || opponentChoice === 'Rock') {
            res.status(200).send(`You won. You chose ${playerChoice}, and your opponent chose ${opponentChoice}.`);
        } else if (opponentChoice === 'Paper' || opponentChoice === 'Lizard') {
            res.status(200).send(`You lost. You chose ${playerChoice}, and your opponent chose ${opponentChoice}.`);
        } else if (opponentChoice === 'Spock') {
            res.status(200).send(`You tie. You chose ${playerChoice}, and your opponent chose ${opponentChoice}.`);
        }
    } else if (playerChoice === 'Lizard') {
        if (opponentChoice === 'Paper' || opponentChoice === 'Spock') {
            res.status(200).send(`You won. You chose ${playerChoice}, and your opponent chose ${opponentChoice}.`);
        } else if (opponentChoice === 'Rock' || opponentChoice === 'Scissors') {
            res.status(200).send(`You lost. You chose ${playerChoice}, and your opponent chose ${opponentChoice}.`);
        } else if (opponentChoice === 'Lizard') {
            res.status(200).send(`You tie. You chose ${playerChoice}, and your opponent chose ${opponentChoice}.`);
        }
    } else {
        res.status(400).send(`Something failed`);
    }
});

app.delete('/requests/:Opponentid', (req, res, next) => {
    const OpponentId = Number(req.params.Opponentid);
    const ownId = Number(req.query.id);
    let index;
    for (let i = 0; i < requestList.length; i++) {
        if (requestList[i].opponent === OpponentId && requestList[i].host === ownId) {
            index = requestList.id;
        }
    }
    requestList.splice(index, 1);
    console.log(requestList);
    res.status(204).send();
});

app.delete('/match/:id', (req, res, next) => {
    const id = Number(req.params.id);
    let index = undefined;
    console.log(id);
    console.log(matchList);
    for (let i = 0; i < matchList.length; i++) {
        console.log(matchList[i]);
        if (matchList[i].host === id) {
            index = matchList[i].id;
            const opId = matchList.opponent;
            for(let z = 0; z < userList.length; z++) {
                if (userList[z].id === id) {
                    userList[z].choice = undefined;
                }
                if (userList[z].id === opId) {
                    userList[z].choice = undefined;
                }
            }
        }
    }
    if (index != undefined) {
        matchList.splice(index, 1);
        console.log(matchList);
    }
    res.status(204).send();
})

app.get('/', (req, res, next) => {
    res.sendFile('client.html', {root: __dirname });
});
