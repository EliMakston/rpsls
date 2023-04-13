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

app.use(express.static(__dirname + '/public'));
app.use(morgan('short'));

server.listen(PORT, () => {
    console.log(`Now listening on port ${PORT}`);
});

app.get('/', (req, res) => {

});

io.on('connection', (socket) => {
    console.log(`New connection`);
    socket.on('disconnect', () => {
        console.log(`User disconnected`);
    });
});