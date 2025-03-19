var express = require('express');
var http = require('http');
var socketIo = require('socket.io');

const fs = require('fs');

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
    //console.log('Server running on http://169.233.254.137:8081/');
});

let validTriangles = []; // Will be populated when game starts
let activeTargets = {};
let players = { 1: null, 2: null }; // Track two player slots
let readyPlayers = 0;
let triangleHits = {};
let playerScores = {1 : 0, 2: 0};

let mapData = JSON.parse(fs.readFileSync('./assets/json/mapData.json')); // Load maps.json
let selectedMap = null;

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Assign the returning player to their original slot
    let playerNumber = null;
    if (!players[1]) {
        playerNumber = 1;
    } 
    else if (!players[2]) {
        playerNumber = 2;
    } 
    else {
        // More than 2 players trying to join
        console.log(`Rejected extra player: ${socket.id}`);
        socket.emit('full', { message: "Game is full!" });
        return; // STOP processing this connection
    }

    players[playerNumber] = { id: socket.id, ready: false, playerNumber };
    console.log(`Assigning Player ${playerNumber} to socket ${socket.id}`);

    // Delay sending the assignment to ensure the client is fully loaded
    setTimeout(() => {
        socket.emit('assignPlayerNumber', playerNumber);
    }, 500);

    socket.on('playerReady', () => {
        if (!players[playerNumber]) return;

        players[playerNumber].ready = true;
        readyPlayers++;

        console.log(`Player ${socket.id} is ready! (${readyPlayers}/2)`);

        if (readyPlayers === 2) {
            triangleHits = {};
            playerScores = { 1: 0, 2: 0 };
            selectedMap = mapData[Math.floor(Math.random() * mapData.length)];
            console.log("🚀 Selected Map:", selectedMap);
            validTriangles = []; //reset valid triangles
            io.emit('startGame', { selectedMap }); // Start the game for both players
            console.log("Both players are ready! Starting the game...");
            // Populate the valid triangle list
            setTimeout(() => {
                io.emit('requestTriangles'); // Ask clients to send triangle data
            }, 1000);
        }
    });

    socket.on('sendTriangles', (data) => {
        if (validTriangles.length === 0) {
            validTriangles = data.triangles; // Store triangles received from clients
        }
    });

    setInterval(() => {
        /*
        if (validTriangles.length === 0) return;

        // Check if an active target already exists
        if (Object.keys(activeTargets).length > 0) {
            return;
        }
    
        let availableTriangles = validTriangles.filter(t => !activeTargets[JSON.stringify(t)]);
        if (availableTriangles.length === 0) return;
    
        let newTarget = availableTriangles[Math.floor(Math.random() * availableTriangles.length)];
        let triangleKey = JSON.stringify(newTarget);
    
        activeTargets[triangleKey] = newTarget;  // ✅ Store new target but do NOT remove old one
    
        io.emit('newTarget', { triangle: newTarget });
        */
        if (validTriangles.length === 0) return;

        let availableTriangles = validTriangles.filter(t => !activeTargets[JSON.stringify(t)]);
        if (availableTriangles.length === 0) return;
    
        let newTarget = availableTriangles[Math.floor(Math.random() * availableTriangles.length)];
        let triangleKey = JSON.stringify(newTarget);
    
        activeTargets[triangleKey] = newTarget;  // ✅ Keep all active targets
    
        io.emit('newTarget', { triangle: newTarget });
    }, 750);

    socket.on('moveReticle', (data) => {
        io.emit('moveReticle', data); // Broadcast movement to all players
    });

    socket.on('hitTriangle', (data) => {
        let triangleKey = JSON.stringify(data.triangle); // Convert the triangle into a unique string
    
        if (!triangleHits[triangleKey]) {
            triangleHits[triangleKey] = 0; // Initialize hit count
        }
    
        if (triangleHits[triangleKey] >= 1) { // If it's already been hit, reject further hits
            console.log("Triangle has already been hit. Ignoring.");
            return;
        }
    
        triangleHits[triangleKey]++; // Increase hit count

        delete activeTargets[triangleKey];
        validTriangles = validTriangles.filter(t => JSON.stringify(t) !== triangleKey);

        let p1 = data.triangle.x1, p2 = data.triangle.y1;
        let p3 = data.triangle.x2, p4 = data.triangle.y2;
        let p5 = data.triangle.x3, p6 = data.triangle.y3;

        // Use the shoelace formula for area
        let triangleSize = Math.abs((p1 * (p4 - p6) + p3 * (p6 - p2) + p5 * (p2 - p4)) / 2);
        let pointsEarned = Math.floor(triangleSize / 10);

        let playerNumber = data.playerNumber; // Player 1 or Player 2
        playerScores[playerNumber] += pointsEarned;
    
        console.log(`Triangle hit! Storing in server: ${triangleKey}`);
    
        io.emit('hitTriangle', {
            triangle: data.triangle,
            hits: triangleHits[triangleKey],
            points: pointsEarned,
            playerNumber: playerNumber, // Send the player number for coloring
            scores: { ...playerScores} // Send full score data
        });

        io.emit('removeTarget', { triangle: data.triangle });
    });

    socket.on('disconnect', () => {
        console.log(`Player ${playerNumber} disconnected: ${socket.id}`);
        if (players[playerNumber] && players[playerNumber].ready) {
            readyPlayers--;
        }
        players[playerNumber] = null; // Free the slot for rejoining players
    });
});