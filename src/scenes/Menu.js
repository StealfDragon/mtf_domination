class Menu extends Phaser.Scene {
    constructor() {
        super("Menu");
    }

    preload() {
        this.load.image('reticle', './assets/img/TempDominationReticle.png')
        //Sound Effect by <a href="https://pixabay.com/users/ribhavagrawal-39286533/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=230500">Ribhav Agrawal</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=230500">Pixabay</a>
        this.load.audio('sfx-laser', './assets/audio/sfx-laser.mp3')
        this.delaunator = 'window.Delaunator';
    }

    create() {
        this.playerNumber = null; // Will be assigned later
        this.isReady = false;

        socket.on('assignPlayerNumber', (num) => {
            this.playerNumber = num;
            console.log(`You are Player ${num}`);
        
            let text = (num === 1) ? "Player 1: Press SPACE to Ready" : "Player 2: Press SPACE to Ready";
            console.log("Received Player Number, setting text:", text);
        
            if (this.readyText) {
                this.readyText.setText(text);
            } else {
                this.readyText = this.add.text(400, 300, text, {
                    fontSize: "24px",
                    fill: "#ffffff"
                }).setOrigin(0.5);
            }
        
            //console.log("Text should be visible now:", this.readyText);
        });

        /*
        socket.on('assignPlayerNumber', (num) => {
            this.playerNumber = num;
            console.log(`You are Player ${num}`);
            
            let text = (num === 1) ? "Player 1: Press SPACE to Ready" : "Player 2: Press SPACE to Ready";
            console.log("Created text (not readyText)")
            this.readyText = this.add.text(400, 300, text, {
                fontSize: "24px",
                fill: "#ffffff"
            }).setOrigin(0.5);
            console.log("Should've loaded the text by now")
        });
        */

        // Listen for ready signal
        socket.on('startGame', () => {
            console.log("Game starting...");
            this.scene.start('playScene');
        });

        // Separate inputs for each player
        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.isReady) {
                this.isReady = true;
                socket.emit('playerReady');
                this.readyText.setText("Waiting for other Player...");
            }
        });

        socket.on('full', () => {
            console.log("Game is full! Redirecting...");
            this.add.text(400, 300, "Game is full. Please wait.", {
                fontSize: "24px",
                fill: "#ff0000"
            }).setOrigin(0.5);
        });
    }
}

/*
class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene")
    }

    preload() {
        this.load.image('reticle', './assets/img/TempDominationReticle.png')
        this.load.image('France', './assets/map/TempFrance.png')
        //Sound Effect by <a href="https://pixabay.com/users/ribhavagrawal-39286533/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=230500">Ribhav Agrawal</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=230500">Pixabay</a>
        this.load.audio('sfx-laser', './assets/audio/sfx-laser.mp3')
        this.delaunator = 'window.Delaunator';
    }

    create() {
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
        keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
        keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
        this.add.text(400, 300, "Press → to Play\n Use Arrow Keys to Aim", {
            fontSize: "32px",
            fill: "#ffffff"
        }).setOrigin(0.5);

        socket.emit('newplayer');

        socket.on('allplayers', (serverPlayers) => {
            Object.keys(serverPlayers).forEach((id) => {
                addPlayer(this, serverPlayers[id]);
            });
        });

        socket.on('newplayer', (player) => {
            addPlayer(this, player);
        });

        socket.on('move', (data) => {
            if (players[data.id]) {
                players[data.id].x = data.x;
                players[data.id].y = data.y;
            }
        });

        socket.on('remove', (id) => {
            if (players[id]) {
                players[id].destroy();
                delete players[id];
            }
        });

        this.input.on('pointerdown', (pointer) => {
            socket.emit('move', { x: pointer.x, y: pointer.y });
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(keyRIGHT)) {
            console.log(Delaunator);
            console.log("switching scene")
            this.scene.start('playScene')
        }
    }

    addPlayer(scene, playerData) {
        let player = scene.add.sprite(playerData.x, playerData.y, 'player');
        players[playerData.id] = player;
    }
}
*/