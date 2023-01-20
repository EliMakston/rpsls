const newUserButton = document.getElementById("new-user-button");
const log = document.getElementById("log");
const choiceForm = document.getElementById("choice-form");
const usersButton = document.getElementById("get-users");
const htmlRepsonse = document.getElementById("users-response");
const usersDiv = document.getElementById("users");
const requestDiv = document.getElementById("request-holder");
const requestBigDiv = document.getElementById("match-request");
let playButton;
let matchButton;
let searchingForPlayer = false;
let inMatch = false;
let receivingRequests = false;
let waitingForMatch = false;

newUserButton.addEventListener("click", newUserRequest);
choiceForm.addEventListener("submit", sendUserChoice);
usersDiv.addEventListener( 'click', function ( event ) {
    if(event.target.className === 'play') {
        waitingForMatch = true;
        matchWithUser(event);
    };
});

requestBigDiv.addEventListener( 'click', function ( event ) {
    if(event.target.className === 'match') {
      getMatchFromRequest(event);
    };
});

let userId = null;

async function newUserRequest(event) {
    event.preventDefault();
    if (userId === null) {
        const response = await fetch('/newUser',  {
            method: 'POST'
        });
        if (response.ok) {
            const responseObject = await response.json();
            userId = responseObject.id;
            log.textContent = `New user created. User id: ${userId}`;
        }
    } else {
        log.textContent = `User already created. User id: ${userId}`;
    };
    searchingForPlayer = true;
    receivingRequests = true;
    consistentGetUsers(event);
};

async function sendUserChoice(event) {
    event.preventDefault();
    event.target.value = '';
    const formData = Object.fromEntries(new FormData(event.target).entries());
    formData.userId = userId;
    const response = await fetch("/choice", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });
    if (response.ok) {
        const responseObject = await response.json();
        log.textContent = `Your choice was succesful: ${responseObject.choice}`;
    } else {
        log.textContent = `Your choice was not succesful`;
    }
}

async function getAllUsers(event) {
    event.preventDefault();
    const response = await fetch('/users');
    const responseObject = await response.json();
    let string = '';
    for (let i = 0; i < responseObject.length; i++) {
        string += `User- ID: ${responseObject[i].id}`;
        if (i != userId) {
            string += `<button id = '${i}' class="play">Play</button>`;
        }
        string += `<br>`
    }
    htmlRepsonse.innerHTML = string;
    playButton = document.getElementsByClassName("play");
}

async function matchWithUser(event) {
    console.log(`Matching with player...`);
    const bodyData = {
        host: userId,
        opponent: event.target.id
    }
    const response = await fetch('/newRequest',  {
        method: 'POST',
        body: JSON.stringify(bodyData),
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (response.ok) {
        const responseObject = await response.json();
        log.textContent = `Request has been made. Request ID: ${responseObject.id}, against User ${responseObject.opponent}`;
        searchingForPlayer = false;
        receivingRequests = false;
        htmlRepsonse.innerHTML = '';
        usersDiv.innerHTML = '';
        waitingForMatch = true;
        waitingForMatchFunction(event);
    } else {
        log.textContent = `Matchmaking failed`;
    }
}

async function playMatch(event) {
    event.preventDefault();
    inMatch = true;
    console.log(`Playing match against player`);
    while (inMatch) {
        await getMove(event);
        inMatch = false;
    }
    await getMove(event);
}

async function getMove(event) {
    let waitingForMove = true;
    while (waitingForMove) {
        const response = await fetch(`/opponentChoice/${userId}`);
        if (response.ok) {
            const responseObject = await response.json();
            log.textContent = `Received from server: ${responseObject.choice}`;
            waitingForMove = false;
        } else {
            log.textContent = `Something went wrong`;
            waitingForMove = false;
        }
    }
};

async function getAllRequests(event) {
    const checkMatch = await fetch('/requests');
    if (checkMatch.ok) {
        console.log('Recieved requesets');
        const matchObject = await checkMatch.json();
        console.log(matchObject)
        for (let i = 0; i < matchObject.length; i++) {
            console.log(matchObject[i]);
            if (matchObject[i].opponent === userId) {
                requestDiv.innerHTML = `<p>You have a new request: from User ${matchObject[i].host}<button id=${i}0 class='match'>Match</button></p>`;
                searchingForPlayer = false;
                matchButton = document.getElementsByClassName("match");
                }
            }
        }
}

async function checkAllMatches(event) {
    const checkMatch = await fetch('/matches');
    if (checkMatch.ok) {
        console.log('Recieved matches');
        const matchObject = await checkMatch.json();
        console.log(matchObject)
        for (let i = 0; i < matchObject.length; i++) {
            console.log(matchObject[i]);
            if (matchObject[i].opponent === userId) {
                requestBigDiv.innerHTML = ``;
                log.textContent = `You are now in a match with User ID: ${matchObject[i].host}`;
                usersDiv.innerHTML = ``;
                waitingForMatch = false;
                }
            }
        }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function consistentGetUsers(event) {
    while (searchingForPlayer) {
        await sleep(3000);
        await getAllUsers(event);
        await getAllRequests(event);
    }
    while (receivingRequests) {
        await sleep(3000);
        await getAllRequests(event);
    }
}

async function waitingForMatchFunction(event) {
    while(waitingForMatch) {
        await sleep(3000);
        checkAllMatches(event);
    }
}

async function getMatchFromRequest(event) {
    console.log(`Creating match with player...`);
    const OpponentID = event.target.id;
    const OpponentIDParsed = OpponentID.toString().substr(0, OpponentID.length-2);
    const bodyData = {
        host: userId,
        opponent: OpponentIDParsed
    }
    const response = await fetch('/newMatch',  {
        method: 'POST',
        body: JSON.stringify(bodyData),
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (response.ok) {
        const responseObject = await response.json();
        log.textContent = `Match has been made. Match ID: ${responseObject.id}, against User ${responseObject.opponent}`;
        searchingForPlayer = false;
        htmlRepsonse.innerHTML = '';
        usersDiv.innerHTML = ``;
        receivingRequests = false;
        requestBigDiv.innerHTML = ``;
    } else {
        log.textContent = `Matchmaking failed`;
    }
}