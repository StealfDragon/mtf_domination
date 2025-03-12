var express = require('express');
var http = require('http');
var socketIo = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = socketIo(server); // Corrected initialization

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/src', express.static(__dirname + '/src'));
app.use('/lib', express.static(__dirname + '/lib'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

server.lastPlayerID = 0;

server.listen(8081, '0.0.0.0', () => {
    console.log('Server running on http://100.64.24.19:8081/');
});


let players = { 1: null, 2: null }; // Track two player slots
let readyPlayers = 0;

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Assign the returning player to their original slot
    let playerNumber = null;
    if (!players[1]) {
        playerNumber = 1;
    } else if (!players[2]) {
        playerNumber = 2;
    }

    if (!playerNumber) {
        socket.emit('full', { message: "Game is full!" });
        return;
    }

    players[playerNumber] = { id: socket.id, ready: false, playerNumber };
    socket.emit('assignPlayerNumber', playerNumber); // Tell client which player they are

    socket.on('playerReady', () => {
        if (!players[playerNumber]) return;

        players[playerNumber].ready = true;
        readyPlayers++;

        console.log(`Player ${socket.id} is ready! (${readyPlayers}/2)`);

        if (readyPlayers === 2) {
            io.emit('startGame'); // Start the game for both players
            console.log("Both players are ready! Starting the game...");
        }
    });

    // Handle player disconnecting
    socket.on('disconnect', () => {
        console.log(`Player ${playerNumber} disconnected: ${socket.id}`);
        if (players[playerNumber] && players[playerNumber].ready) {
            readyPlayers--;
        }
        players[playerNumber] = null; // Free the slot for rejoining players
    });
});