import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';
const app = express();
const server = http.createServer(app);
const io = new Server(server);