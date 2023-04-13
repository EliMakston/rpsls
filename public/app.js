const socket = io();
const nickForm = document.getElementById('nick-form');
const nickInput = document.getElementById('nick-input');

nickForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const newNick = nickInput.value;
    socket.emit("new nick", newNick);
});

socket.on('new user', (userName) => {
    
})