class Play extends Phaser.Scene {
    constructor() {
        super("playScene")
        
    }

    create(data) {
        //console.log("Received map from server:", serverData);
        
        this.selectedMap = data.selectedMap;
        //console.log(`Server chose map: ${this.selectedMap.country}`);
    
        if (!this.selectedMap || !this.selectedMap.points) {
            console.error("No map data received from server!");
            return;
        }
    
        console.log(`Server chose map: ${this.selectedMap.country}`);

        const scaledPoints = this.selectedMap.points.map(val => 
            val * this.selectedMap.scaleFactor
        );

        // Create polygon
        this.countryOutline = new Phaser.Geom.Polygon(scaledPoints);

        this.graphics = this.add.graphics({ lineStyle: { width: 3, color: 0xf5ad42 } });
        this.graphics.strokePoints(this.countryOutline.points, true)

        this.triangles = this.triangulateCountry(this.countryOutline)
        this.drawTriangles(this, this.triangles)

        this.playerScores = { 1: 0, 2: 0 }; // Store both player scores

        this.player1ScoreText = this.add.text(20, 20, 'P1 Score: 0', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setScrollFactor(0);

        this.player2ScoreText = this.add.text(500, 20, 'P2 Score: 0', { // Adjust position for Player 2
            fontSize: '24px',
            fill: '#ffffff'
        }).setScrollFactor(0);

        /*
        //initialize score and score text
        this.score = 0
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '24px',
            fill: '#ffffff'
        })
        this.scoreText.setScrollFactor(0)
        */

        // Add a hit counter to each triangle
        this.triangleHits = new window.Map(); // Store hit counts

        this.triangles.forEach(triangle => {
            this.triangleHits.set(triangle, 0); // Initialize hit count
        });

        this.reticle = this.add.sprite(400, 300, 'reticle')
        this.cursors = this.input.keyboard.createCursorKeys()
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        this.cameras.main.setBounds(0, 0, 1200, 630); // Adjust based on map size
        this.cameras.main.setZoom(1)
        // Create a second camera (Reticle Zoom Camera)
        this.reticleCam = this.cameras.add(740, 0, 700, 630) // Position it on the right
            .setZoom(3) // Zoom in on the reticle
            .setBounds(0, 0, 1200, 630)
            .startFollow(this.reticle, true, 0.1, 0.1); // Smooth follow

            this.cameras.main.ignore(this.reticle);

            //let camBorder = this.add.rectangle(1090, 315, 700, 630, 0x000000).setOrigin(0.5);
            //camBorder.setStrokeStyle(4, 0xffffff); // White border for visibility
        
        this.players = {}; // Store both players
        this.reticles = {}; // Store reticles for each player
        this.playerNumber = data.playerNumber; // Receive playerNumber from Menu.js

        console.log(`Entered Play Scene as Player ${this.playerNumber}`);

        socket.on('allplayers', (serverPlayers) => {
            Object.keys(serverPlayers).forEach((id) => {
                this.addPlayer(id, serverPlayers[id]);
            });

            socket.emit('newplayer'); // Inform server we've entered the game
        });

        socket.on('newplayer', (player) => {
            this.addPlayer(player.id, player);
        });

        socket.on('moveReticle', (data) => {
            if (data.id !== socket.id && this.reticles[data.id]) {
                this.reticles[data.id].x = data.x;
                this.reticles[data.id].y = data.y;
            }
        });

        socket.on('remove', (id) => {
            if (this.players[id]) {
                this.players[id].destroy();
                delete this.players[id];
            }
            if (this.reticles[id]) {
                this.reticles[id].destroy();
                delete this.reticles[id];
            }
        });

        socket.on('hitTriangle', (data) => {
            let triangleKey = JSON.stringify(data.triangle);
        
            if (!this.triangleHits[triangleKey]) {
                this.triangleHits[triangleKey] = data.hits;
        
                this.playerScores = data.scores;
                this.player1ScoreText.setText(`P1 Score: ${this.playerScores[1]}`);
                this.player2ScoreText.setText(`P2 Score: ${this.playerScores[2]}`);
        
                this.colorTriangle(data.triangle, data.playerNumber);
            }

            /*
            if (!this.triangleHits[triangleKey]) {
                this.triangleHits[triangleKey] = data.hits;
        
                // Visually mark the triangle as hit
                let graphics = this.add.graphics({ fillStyle: { color: 0xff0000, alpha: 0.5 } });
                graphics.fillTriangleShape(data.triangle);
            }
            */
        });

        // Create the reticle for THIS player
        // this.reticles[socket.id] = this.add.image(400, 300, 'reticle');

        // Capture mouse movement & update reticle position
        this.input.on('pointermove', (pointer) => {
            if (this.reticles[socket.id]) {
                this.reticles[socket.id].x = pointer.x;
                this.reticles[socket.id].y = pointer.y;
                socket.emit('moveReticle', { id: socket.id, x: pointer.x, y: pointer.y });
            }
        });

        /*
        socket.on('newplayer', () => {
            if (!players[1] || !players[2]) {
                socket.emit('allplayers', players);
                socket.broadcast.emit('newplayer', players[playerNumber]);
            } else {
                socket.emit('full', { message: "Game is full!" });
            }
        });
        */
    }

    update() {
        if (!this.cursors) return;
        let speed = 3.5;

        let prevX = this.reticle.x;
        let prevY = this.reticle.y;

        if (this.cursors.left.isDown) this.reticle.x -= speed;
        if (this.cursors.right.isDown) this.reticle.x += speed;
        if (this.cursors.up.isDown) this.reticle.y -= speed;
        if (this.cursors.down.isDown) this.reticle.y += speed;

        // Prevent going out of bounds
        this.reticle.x = Math.max(0, Math.min(700, this.reticle.x));
        this.reticle.y = Math.max(0, Math.min(700, this.reticle.y));

        // Only send updates if the position changed
        if (prevX !== this.reticle.x || prevY !== this.reticle.y) {
            socket.emit('moveReticle', { id: socket.id, x: this.reticle.x, y: this.reticle.y });
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.fireReticle()
            this.sound.play('sfx-laser')
        }
    }


    fireReticle() {
        // Check if the reticle is over a triangle
        for (let triangle of this.triangles) {
            if (Phaser.Geom.Triangle.Contains(triangle, this.reticle.x, this.reticle.y)) {
                let triangleKey = JSON.stringify(triangle);
    
                if (this.triangleHits[triangleKey]) { // If it's already been hit, ignore it
                    console.log("Triangle has already been hit. No more scoring.");
                    return;
                }
    
                socket.emit('hitTriangle', { triangle, playerNumber: this.playerNumber });
    
                break; // Stop checking after the first valid hit
            }
            /*
            if (Phaser.Geom.Triangle.Contains(triangle, this.reticle.x, this.reticle.y)) {
                let currentHits = this.triangleHits.get(triangle) || 0

                if (currentHits >= 1) {
                    console.log("Triangle has already been hit once. No more scoring.")
                    return; // Stop further scoring
                }

                // Calculate the triangle's size (area)
                let triangleSize = Phaser.Geom.Triangle.Area(triangle);

                // Give points based on size (example: 10 points per unit of area)
                let pointsEarned = Math.floor(triangleSize / 10); // Adjust scoring factor if needed
                this.score += pointsEarned

                // Update score text
                this.scoreText.setText('Score: ' + this.score)
                
                // Increase hit count
                this.triangleHits.set(triangle, currentHits + 1)

                socket.emit('hitTriangle', { triangle, hits: currentHits + 1 });

                // Change triangle color to indicate it's been hit
                let graphics = this.add.graphics({ fillStyle: { color: 0xff0000, alpha: 0.5 } })
                graphics.fillTriangleShape(triangle);

                console.log(`Hit triangle! Size: ${triangleSize}, Score: ${this.score}`);

                break; // Stop after hitting one triangle
                
            }
                */
        }
    }

    
    triangulateCountry(countryOutline) {
        let points = countryOutline.points.map(p => [p.x, p.y]); // Convert Phaser points to array
        let delaunay = Delaunator.from(points);
        let triangles = [];

        for (let i = 0; i < delaunay.triangles.length; i += 3) {
            let p1 = points[delaunay.triangles[i]];
            let p2 = points[delaunay.triangles[i + 1]];
            let p3 = points[delaunay.triangles[i + 2]];

            // Calculate center of the triangle
            let centerX = (p1[0] + p2[0] + p3[0]) / 3;
            let centerY = (p1[1] + p2[1] + p3[1]) / 3;

            // Check if the triangle's center is inside the polygon
            if (Phaser.Geom.Polygon.Contains(countryOutline, centerX, centerY)) {
                let t = new Phaser.Geom.Triangle(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
                triangles.push(t);
            }
        }

        return triangles;
    }

    drawTriangles(scene, triangles) {
        triangles.forEach(triangle => {
            let graphics = scene.add.graphics({ lineStyle: { width: 3, color: 0xf5ad42 } });
            graphics.strokeTriangleShape(triangle);
    
            // Make interactive
            graphics.setInteractive(triangle, Phaser.Geom.Triangle.Contains);
            /*
            graphics.on('pointerdown', function () {
                console.log("Triangle clicked:", triangle);
                let graphics = scene.add.graphics({ fillStyle: { color: 0xff0000, alpha: 0.5 } });
                graphics.fillTriangleShape(triangle);
            });
            */
        });
    }

    addPlayer(id, playerData) {
        if (this.reticles[id]) return;

        // Add player & reticle when a new player joins
        // this.players[id] = this.add.sprite(playerData.x, playerData.y, 'player');
        this.reticles[id] = this.add.image(playerData.x, playerData.y, 'reticle');
    }

    colorTriangle(triangle, playerNumber) {
        let color = (playerNumber === 1) ? 0x0000ff : 0xff0000; // Blue for P1, Red for P2
        console.log(`Coloring triangle ${JSON.stringify(triangle)} for Player ${playerNumber}`);

        let graphics = this.add.graphics({ fillStyle: { color: color, alpha: 0.5 } });
        graphics.fillTriangleShape(new Phaser.Geom.Triangle(triangle.x1, triangle.y1, triangle.x2, triangle.y2, triangle.x3, triangle.y3));
    }

    selectRandomMap() {
        const randomIndex = Phaser.Math.Between(0, this.mapData.length - 1);
        return this.mapData[randomIndex];
    }
}