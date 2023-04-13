import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 5000;

class User {
    constructor(socketId) {
        this.id = socketId;
        this.nick = 'User';
    }
};

const userList = [];

app.use(express.static(__dirname + '/public'));
app.use(morgan('short'));

server.listen(PORT, () => {
    console.log(`Now listening on port ${PORT}`);
});

app.get('/', (req, res) => {

});

async function getUserInfo() {
    const sockets = await io.fetchSockets();
    const userInfo = [];
    for (let i = 0; i < sockets.length; i++) {
        const newUser = {
            id: sockets[i].id,
            nick: sockets[i].nick,
            room: sockets[i].rooms
        }
        userInfo.push(newUser);
    }
    return userInfo;
}

io.on('connection', async (socket) => {
    const userInfo = getUserInfo();
    socket.join("lobby");
    socket.nick = 'User';
    console.log(`New connection`);
    socket.on('disconnect', () => {
        console.log(`${socket.nick} disconnected`);
    });
    socket.on("new nick", (newNick) => {
        socket.nick = newNick;
    });
});