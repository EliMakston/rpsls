//Grab all necessary objects from the document
let newUserButton = document.getElementById("new-user-button");
let log = document.getElementById("log");
let choiceForm = document.getElementById("choice-form");
let usersButton = document.getElementById("get-users");
let htmlRepsonse = document.getElementById("users-response");
let usersDiv = document.getElementById("users");
let requestDiv = document.getElementById("request-holder");
let requestBigDiv = document.getElementById("match-request");
const mainHTML = document.getElementById("main");

//Get the default state of the page
const defaultHTML = mainHTML.innerHTML;

//create some temporary holders for buttons that don't yet exist
let playButton;
let matchButton;

//create some booleans for while loops that will run later
let searchingForPlayer = false;
let canReturnHome = false;
let receivingRequests = false;
let waitingForMatch = false;
let waitingForMove = false;
let userId = null;
const inGame = true;

//add event listeners for the objects that we grabbed
newUserButton.addEventListener("click", function (event) {
    if (canReturnHome) {
        returnToDefault(event);
    } else {
        newUserRequest(event);
    }
});
choiceForm.addEventListener("submit", sendUserChoice);

//this adds the temporary event listener for the buttons that don't exist yet
usersDiv.addEventListener('click', function ( event ) {
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

//Sends a POST request to /newUser on the API, then sets the client ID accordingly
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
            newUserButton.innerHTML = `Reset Page`;
            canReturnHome = true;
        }
    } else {
        log.textContent = `User already created. User id: ${userId}`;
    };
    //toggles searching for players and recieving requests from other players
    searchingForPlayer = true;
    receivingRequests = true;
    //Grabs consistent updates from the API
    consistentUpdates(event);
};

//When the form is submitted, sends a POST request to the API for the user choice
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
        //Toggles consistent checks for opponent move
        waitingForMove = true;
    } else {
        log.textContent = `Your choice was not succesful`;
    }
}

//Gets all players that are online, and sets the corresponding div to show them
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

//Attempts to give corresponsing opponent a request for a game
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
        //Toggles waiting for match, and gets consitent updates on matches
        waitingForMatch = true;
        //Toggles requests off, and stops searching for other players
        searchingForPlayer = false;
        receivingRequests = false;
        //removes the users from the div
        htmlRepsonse.innerHTML = '';
        usersDiv.innerHTML = '';
    } else {
        log.textContent = `Matchmaking failed`;
    }
}

//Checks if the opponent has chosen a move yet
async function getMove(event) {
    const response = await fetch(`/opponentChoice/${userId}`);
    //if they have, send back a response with that choice
    if (response.ok) {
        const responseObject = await response.json();
        log.textContent = `Received from server: ${responseObject.choice}`;
        waitingForMove = false;
    } else {
        //if they haven't, send a waiting response
        log.textContent = `Opponent is still choosing...`
    }
};

//gets all requests and saves them to the request divider
async function getAllRequests(event) {
    const checkMatch = await fetch('/requests');
    if (checkMatch.ok) {
        console.log('Recieved requesets');
        const matchObject = await checkMatch.json();
        string = '';
        for (let i = 0; i < matchObject.length; i++) {
            if (matchObject[i].opponent === userId) {
                string += `<p>You have a new request: from User ${matchObject[i].host}<button id=${matchObject[i].host}0 class='match'>Match</button></p><br>`;
                matchButton = document.getElementsByClassName("match");
                }
            }
        }
        requestDiv.innerHTML = string;
}

//check all matches and update if you are in one
async function checkAllMatches(event) {
    const checkMatch = await fetch('/matches');
    if (checkMatch.ok) {
        console.log('Recieved matches');
        const matchObject = await checkMatch.json();
        for (let i = 0; i < matchObject.length; i++) {
            if (matchObject[i].opponent === userId) {
                requestBigDiv.innerHTML = ``;
                log.textContent = `You are now in a match with User ID: ${matchObject[i].host}`;
                usersDiv.innerHTML = ``;
                waitingForMatch = false;
                }
            }
        }
}

//sleep to keep infinite loop from spiraling out of control
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//check if the player won or lost
async function winOrLose(playerId) {
    const response = await fetch(`/winOrLose/${playerId}`);
    if (response.ok) {
        let string = await response.text();
        log.textContent = string;
    }
};

//create a match based off of a request
async function getMatchFromRequest(event) {
    console.log(`Creating match with player...`);
    searchingForPlayer = false;
    const OpponentID = event.target.id;
    const OpponentIDParsed = OpponentID.toString().substr(0, OpponentID.length-1);
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
};

//set all HTML back to homepage
async function returnToDefault(event) {
    mainHTML.innerHTML = defaultHTML;
    searchingForPlayer = true;
    receivingRequests = true;
    newUserButton = document.getElementById("new-user-button");
    log = document.getElementById("log");
    choiceForm = document.getElementById("choice-form");
    usersButton = document.getElementById("get-users");
    htmlRepsonse = document.getElementById("users-response");
    usersDiv = document.getElementById("users");
    requestDiv = document.getElementById("request-holder");
    requestBigDiv = document.getElementById("match-request");
};

//get all updates every 3 seconds (could be faster, but for safety, 3 is cap)
async function consistentUpdates(event) {
    while (inGame) {
        await sleep(3000);
        if (searchingForPlayer) {
            await getAllUsers(event);
            await getAllRequests(event);
        }
        if (receivingRequests) {
            await getAllRequests(event);
        }
        if (waitingForMove) {
            await getMove(event);
            if (!waitingForMove) {
                await winOrLose(userId);
            }
        }
        if (waitingForMatch) {
            checkAllMatches(event);
        }
    }
}