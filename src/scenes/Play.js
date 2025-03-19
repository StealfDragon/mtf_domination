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

        this.xOffset = this.selectedMap.xOffset
        this.yOffset = this.selectedMap.yOffset

        const adjustedPoints = [];
        for (let i = 0; i < this.selectedMap.points.length; i += 2) {
            let x = (this.selectedMap.points[i] * this.selectedMap.scaleFactor) + this.xOffset;
            let y = (this.selectedMap.points[i + 1] * this.selectedMap.scaleFactor) + this.yOffset;
            adjustedPoints.push({ x, y });
        }

        /*
        const adjustedPoints = this.selectedMap.points.map((val, i) => 
            (val * this.selectedMap.scaleFactor) + (i % 2 === 0 ? xOffset : yOffset)
        );
        */

        // Create polygon
        this.countryOutline = new Phaser.Geom.Polygon(adjustedPoints);

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

        this.activeTarget = null; // Store the active target
        this.targetPoint = this.add.circle(0, 0, 5, 0xffffff).setVisible(false); // Invisible until assigned
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
       
        // // Create a red rectangle for the danger bar
        // this.dangerBarOutline = this.add.rectangle(100, 500, 30, 100, 0xffffff).setOrigin(0.5, 1).setStrokeStyle(2, 0xff0000);
        // this.dangerFill = this.add.rectangle(100, 500, 30, 1, 0xff0000).setOrigin(0.5, 1);
        
        // this.dangerLevel = 0;
        // this.dangerMax = 100;
        // this.dangerGrowthRate = this.dangerMax / 10;
        // this.dangerUpdateTime = 5000;
        // this.inQTE = false;
    
        // QTE Elements
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.qteActive = false;
        this.qteTimer = null;
        this.qteBar = this.add.rectangle(600, 500, 400, 30, 0xff0000).setVisible(false); // Red QTE Zone
        this.qteTarget = this.add.rectangle(600, 500, 50, 30, 0x00ff00).setVisible(false); // Green Target Zone
        this.qteMarker = this.add.rectangle(400, 500, 10, 30, 0x888888).setVisible(false); // Grey Moving Bar
        this.qteDirection = 1; // Move right initially

        // Randomly start the QTE event every 10-20 seconds
        this.scheduleQTE();

        
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
        
            // Find the triangle in our stored list
            let triangle = this.triangles.find(t => JSON.stringify(t) === triangleKey);
            
            if (!triangle) {
                console.warn("Triangle not found for hit event:", data.triangle);
                return;
            }
        
            // Remove dot if present
            if (this.triangleDots.has(triangle)) {
                this.triangleDots.get(triangle).destroy(); // Remove dot from scene
                this.triangleDots.delete(triangle); // Remove reference
            }
        
            // Mark the triangle as hit
            this.triangleHits.set(triangle, (this.triangleHits.get(triangle) || 0) + 1);        
            // Update scores
            this.playerScores = data.scores;
            this.player1ScoreText.setText(`P1 Score: ${this.playerScores[1]}`);
            this.player2ScoreText.setText(`P2 Score: ${this.playerScores[2]}`);
        
            // Color the triangle to indicate it was hit
            this.colorTriangle(data.triangle, data.playerNumber);
        });
        
        //socket.on('hitTriangle', (data) => {
            //let triangleKey = JSON.stringify(data.triangle);
        
            //if (!this.triangleHits[triangleKey]) {
                //this.triangleHits[triangleKey] = data.hits;
        
                //this.playerScores = data.scores;
                //this.player1ScoreText.setText(`P1 Score: ${this.playerScores[1]}`);
                //this.player2ScoreText.setText(`P2 Score: ${this.playerScores[2]}`);
        
                //this.colorTriangle(data.triangle, data.playerNumber);
            //}

            /*
            if (!this.triangleHits[triangleKey]) {
                this.triangleHits[triangleKey] = data.hits;
        
                // Visually mark the triangle as hit
                let graphics = this.add.graphics({ fillStyle: { color: 0xff0000, alpha: 0.5 } });
                graphics.fillTriangleShape(data.triangle);
            }
            */
        //});
        // });

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

        socket.on('newTarget', (data) => {
            this.activeTarget = data.triangle;
        
            let centerX = (data.triangle.x1 + data.triangle.x2 + data.triangle.x3) / 3;
            let centerY = (data.triangle.y1 + data.triangle.y2 + data.triangle.y3) / 3;
        
            this.targetPoint.setPosition(centerX, centerY).setVisible(true);
        });
        
        setTimeout(() => {
            socket.emit('sendTriangles', { triangles: this.triangles });
        }, 1000);
        
        
        
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
    scheduleQTE() {
        let delay = Phaser.Math.Between(10000, 20000); // 10-20 seconds
    
        this.time.delayedCall(delay, () => {
            this.startQTE();
        });
    }
    startQTE() {
        if (this.qteActive) return; // Prevent multiple QTEs from starting
    
        this.qteActive = true;
    
        // Position the red QTE Zone at the bottom center
        this.qteBar.setPosition(600, 500).setVisible(true);
    
        // Randomly position the green target zone within the red bar
        let minX = this.qteBar.x - this.qteBar.width / 2 + this.qteTarget.width / 2;
        let maxX = this.qteBar.x + this.qteBar.width / 2 - this.qteTarget.width / 2;
        this.qteTarget.setPosition(Phaser.Math.Between(minX, maxX), 500).setVisible(true);
    
        // Start the grey marker moving left and right
        this.qteMarker.setPosition(this.qteBar.x - this.qteBar.width / 2, 500).setVisible(true);
        this.qteDirection = 1; // Move right
    
        // Timer to end the QTE after a few seconds
        this.qteTimer = this.time.delayedCall(3000, () => {
            this.endQTE(false); // Auto-fail if not completed in time
        });
    
        console.log("QTE Started!");
    }
    
    update() {
        // if (!this.cursors || this.inQTE) return; // Disable movement during QTE

        if (!this.cursors) return;
        let speed = 7;

        let prevX = this.reticle.x;
        let prevY = this.reticle.y;

        if (this.cursors.left.isDown) this.reticle.x -= speed;
        if (this.cursors.right.isDown) this.reticle.x += speed;
        if (this.cursors.up.isDown) this.reticle.y -= speed;
        if (this.cursors.down.isDown) this.reticle.y += speed;

        if (this.qteActive) {
            let speed = 8; // Adjust speed for difficulty
            this.qteMarker.x += this.qteDirection * speed;
    
            // Reverse direction if hitting the edge of the QTE bar
            if (this.qteMarker.x >= this.qteBar.x + this.qteBar.width / 2 || 
                this.qteMarker.x <= this.qteBar.x - this.qteBar.width / 2) {
                this.qteDirection *= -1;
            }
    
            // Check for player input
            if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
                this.checkQTE();
            }
            return;
        }
        // let scoreDiff = Math.abs(this.playerScores[1] - this.playerScores[2]);
        // let behindPlayer = (this.playerScores[this.playerNumber] < this.playerScores[3 - this.playerNumber]);

        // this.time.addEvent({
        //     delay: this.dangerUpdateTime,
        //     callback: () => {
        //         if (this.dangerLevel < this.dangerMax) {
        //             this.dangerLevel += this.dangerGrowthRate;
        //             this.dangerFill.setSize(30, this.dangerLevel); // Grow vertically
        //         }

        //         if (this.dangerLevel >= this.dangerMax && !this.inQTE) {
        //             this.startQTE();
        //         }
        //     },
        //     loop: true
        // });
        

        // if (scoreDiff >= 50 && behindPlayer) {
        //     let dangerBar = this.dangerBars[this.playerNumber];
        //     // dangerBar.setVisible(true);

        //     // Increase danger speed based on score gap
        //     this.dangerSpeed[this.playerNumber] = Math.min(scoreDiff / 10, 5);
        //     this.dangerLevels[this.playerNumber] += this.dangerSpeed[this.playerNumber];

        //     let fillAmount = Math.min(this.dangerLevels[this.playerNumber] / this.dangerMax, 1);
        //     dangerBar.setScale(1, fillAmount);

        //     if (this.dangerLevels[this.playerNumber] >= this.dangerMax) {
        //         console.log("DANGER MAXED OUT! Quick Time Event starts!");
        //         this.startQTE();
        //     }
        // } else {
        //     this.dangerBars[this.playerNumber].setVisible(false);
        //     this.dangerLevels[this.playerNumber] = 0;
        // }

        // if (this.inQTE && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        //     let indicatorY = this.qteIndicator.y;
        //     let zoneY = this.qteTargetY;

        //     if (Math.abs(indicatorY - zoneY) <= 15) {
        //         console.log("QTE SUCCESS!");
        //         this.qteComplete(true);
        //     } else {
        //         console.log("QTE FAILED! Game Over!");
        //         this.qteComplete(false);
        //     }
        // }

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

    checkQTE() {
        let markerX = this.qteMarker.x;
        let targetX = this.qteTarget.x;
        let targetWidth = this.qteTarget.width / 2;
    
        if (markerX >= targetX - targetWidth && markerX <= targetX + targetWidth) {
            console.log("QTE Success!");
            this.endQTE(true); // Player succeeded
        } else {
            console.log("QTE Failed!");
            this.endQTE(false); // Player failed
        }
    }
    
    endQTE(success) {
        this.qteActive = false;
    
        // Hide all QTE elements
        this.qteBar.setVisible(false);
        this.qteTarget.setVisible(false);
        this.qteMarker.setVisible(false);
    
        // Cancel the auto-fail timer if it exists
        if (this.qteTimer) {
            this.qteTimer.remove(false);
        }
    
        if (success) {
            console.log("Player Successfully Completed the QTE!");
            // Reward the player (e.g., extra score)
            this.playerScores[this.playerNumber] += 50;
            this.player1ScoreText.setText(`P1 Score: ${this.playerScores[1]}`);
            this.player2ScoreText.setText(`P2 Score: ${this.playerScores[2]}`);
        } else {
            console.log("Player Failed the QTE!");
            // Punish the player (optional)
        }
    
        // Schedule the next QTE randomly
        this.scheduleQTE();
    }
    

    fireReticle() {
        if (!this.activeTarget) return;
    
        if (Phaser.Geom.Triangle.Contains(this.activeTarget, this.reticle.x, this.reticle.y)) {
            let triangleKey = JSON.stringify(this.activeTarget);
    
            if (this.triangleHits[triangleKey] >= 4) {
                console.log("Triangle already fully hit.");
                return;
            }
    
            socket.emit('hitTriangle', { triangle: this.activeTarget, playerNumber: this.playerNumber });
    
            // Hide the target point until a new one is assigned
            this.targetPoint.setVisible(false);
            this.activeTarget = null;
        }
    }
    
    // fireReticle() {
    //     // Check if the reticle is over a triangle

    //     for (let triangle of this.triangles) {
    //         if (Phaser.Geom.Triangle.Contains(triangle, this.reticle.x, this.reticle.y)) {
    //             let triangleKey = JSON.stringify(triangle);
    
    //             if (this.triangleHits[triangleKey]) { // If it's already been hit, ignore it
    //                 console.log("Triangle has already been hit. No more scoring.");
    //                 return;
    //             }
    
    //             socket.emit('hitTriangle', { triangle, playerNumber: this.playerNumber });
    
    //             break; // Stop checking after the first valid hit
    //         }
    //         /*
    //         if (Phaser.Geom.Triangle.Contains(triangle, this.reticle.x, this.reticle.y)) {
    //             let currentHits = this.triangleHits.get(triangle) || 0

    //             if (currentHits >= 1) {
    //                 console.log("Triangle has already been hit once. No more scoring.")
    //                 return; // Stop further scoring
    //             }

    //             // Calculate the triangle's size (area)
    //             let triangleSize = Phaser.Geom.Triangle.Area(triangle);

    //             // Give points based on size (example: 10 points per unit of area)
    //             let pointsEarned = Math.floor(triangleSize / 10); // Adjust scoring factor if needed
    //             this.score += pointsEarned

    //             // Update score text
    //             this.scoreText.setText('Score: ' + this.score)
                
    //             // Increase hit count
    //             this.triangleHits.set(triangle, currentHits + 1)

    //             socket.emit('hitTriangle', { triangle, hits: currentHits + 1 });

    //             // Change triangle color to indicate it's been hit
    //             let graphics = this.add.graphics({ fillStyle: { color: 0xff0000, alpha: 0.5 } })
    //             graphics.fillTriangleShape(triangle);

    //             console.log(`Hit triangle! Size: ${triangleSize}, Score: ${this.score}`);

    //             break; // Stop after hitting one triangle
                
    //         }
    //             */
    //     }
    // }

    spawnTarget() {
        // Filter out already shot triangles
        let availableTriangles = this.validTriangles.filter(triangle => this.triangleHits.get(triangle) < 4);
    
        // If no triangles remain, stop spawning targets
        if (availableTriangles.length === 0) {
            console.log("No more valid targets.");
            this.targetPoint.setVisible(false);
            return;
        }
    
        // Pick a random triangle from available ones
        let randomTriangle = Phaser.Utils.Array.GetRandom(availableTriangles);
        this.activeTarget = randomTriangle; // Store active target
    
        // Calculate triangle center
        let centerX = (randomTriangle.x1 + randomTriangle.x2 + randomTriangle.x3) / 3;
        let centerY = (randomTriangle.y1 + randomTriangle.y2 + randomTriangle.y3) / 3;
    
        // Move the target point to the new location and make it visible
        this.targetPoint.setPosition(centerX, centerY).setVisible(true);
    }


    // startQTE() {
    //     this.inQTE = true; // Disable movement
    //     this.qteSuccess = false; // Track QTE success
    
    //     // let dangerBar = this.dangerBars[this.playerNumber];
    
    //     // Create a random "target zone"
    //     this.qteTargetY = Phaser.Math.Between(-40, 40); // Random position
    //     this.qteZone = this.add.rectangle(dangerBar.x, dangerBar.y + this.qteTargetY, 20, 30, 0x00ff00).setOrigin(0.5, 0.5);

    //     // Create moving indicator
    //     this.qteIndicator = this.add.rectangle(dangerBar.x, dangerBar.y - 50, 20, 10, 0xff0000).setOrigin(0.5, 0.5);
    //     this.qteDirection = 1;
    //     this.qteSpeed = 2;
    
    //     console.log("Quick Time Event Started!");
    
    //     // Listen for SPACE key press
    //     this.qteKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    //     this.qteLoop = this.time.addEvent({
    //         delay: 30, // Speed of movement
    //         loop: true,
    //         callback: () => {
    //             this.qteIndicator.y += this.qteDirection * this.qteSpeed;
    
    //             // Reverse direction if reaching the edges
    //             if (this.qteIndicator.y >= dangerBar.y + 50) {
    //                 this.qteDirection = -1;
    //             } else if (this.qteIndicator.y <= dangerBar.y - 50) {
    //                 this.qteDirection = 1;
    //             }
    //         }
    //     });
    // }

    


    // qteComplete(success) {
    //     this.qteLoop.remove();
    //     this.qteIndicator.destroy();
    //     this.qteZone.destroy();
    
    //     if (success) {
    //         this.dangerLevels[this.playerNumber] = 0;
    //         this.dangerBars[this.playerNumber].setScale(1, 0);
    //         console.log("Player survived! Danger bar reset.");
    //     } else {
    //         console.log("GAME OVER! Player failed QTE.");
    //         this.scene.start("gameOverScene"); // Transition to Game Over screen
    //     }
    
    //     this.inQTE = false; // Re-enable control
    // }
    
    
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
