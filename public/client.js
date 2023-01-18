const newUserForm = document.getElementById("new-user-form");
const log = document.getElementById("log");

newUserForm.addEventListener("submit", newUserRequest);

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