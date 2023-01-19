const newUserButton = document.getElementById("new-user-button");
const log = document.getElementById("log");
const choiceForm = document.getElementById("choice-form");
const usersButton = document.getElementById("get-users");
const htmlRepsonse = document.getElementById("users-response");
const usersDiv = document.getElementById("users");
let playButton;

newUserButton.addEventListener("click", newUserRequest);
choiceForm.addEventListener("submit", sendUserChoice);
usersButton.addEventListener("click", getAllUsers);
usersDiv.addEventListener( 'click', function ( event ) {
    if(event.target.className === 'play') {
      matchWithUser(event);
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
    event.preventDefault();
    const bodyData = {
        host: userId,
        opponent: event.target.id
    }
    const response = fetch('/newMatch',  {
        method: 'POST',
        body: JSON.stringify(bodyData),
        headers: {
            "Content-Type": "application/json",
        },
    });
    console.log(`Matching with player...`);
}

async function playMatch(event) {
    event.preventDefault();
    console.log(`Playing match against player`);
}

//TODO See if while loops can be used to continuously update a list of a site