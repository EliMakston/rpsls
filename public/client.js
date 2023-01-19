const newUserForm = document.getElementById("new-user-form");
const log = document.getElementById("log");
const choiceForm = document.getElementById("choice-form");

newUserForm.addEventListener("submit", newUserRequest);
choiceForm.addEventListener("submit", sendUserChoice);

let userId = null;

async function newUserRequest(event) {
    event.preventDefault();
    if (userId === null) {
        const formData = Object.fromEntries(new FormData(event.target).entries());
        const response = await fetch('/newUser',  {
            method: 'POST'
        });
        if (response.ok) {
            const responseObject = await response.json();
            userId = responseObject._id;
            log.textContent = `New user created. User id: ${userId}`;
        }
    } else {
        log.textContent = `User already created. User id: ${userId}`;
    };
};

async function sendUserChoice(event) {
    event.preventDefault();
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