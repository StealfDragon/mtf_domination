class Menu extends Phaser.Scene {
    constructor() {
        super("Menu");
    }

    preload() {
        this.load.image('reticle', './assets/img/TempDominationReticle.png')
        //Sound Effect by <a href="https://pixabay.com/users/ribhavagrawal-39286533/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=230500">Ribhav Agrawal</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=230500">Pixabay</a>
        this.load.audio('sfx-laser', './assets/audio/sfx-laser.mp3')
        this.delaunator = 'window.Delaunator';
        this.load.path = "./assets/"
        this.load.json('mapData', 'json/mapData.json')
    }

    create() {
        this.playerNumber = null; // Will be assigned later
        this.isReady = false;

        this.add.text(400, 100, "DOMINATION", {
            fontSize: "48px",
            fontStyle: "bold",
            fill: "#ffffff"
        }).setOrigin(0.5);

        // Always show the ready text, even if player number isn't assigned yet
        this.readyText = this.add.text(400, 300, "Press SPACE to Ready", {
            fontSize: "24px",
            fill: "#ffffff"
        }).setOrigin(0.5);

        // Add instructions under the ready prompt
        this.add.text(400, 400, "Instructions: shoot the triangle regions when a target appears in them.\nBut watch out! Every so often, you'll get a shock (a quick time event, which is a game over if lost).\nFirst person to reach 8000 points wins.", {
            fontSize: "18px",
            fill: "#cccccc",
            align: "center"
        }).setOrigin(0.5);

        // Add credits at the bottom
        this.add.text(400, 550, "Created by Cassian Jones and Evan Lara", {
            fontSize: "18px",
            fill: "#999999"
        }).setOrigin(0.5);

        socket.on('assignPlayerNumber', (num) => {
            this.playerNumber = num;
            console.log(`You are Player ${num}`);
            
            /*
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
            */
        });

        let text = (playerNumber === 1) ? "Player 1: Press SPACE to Ready" : "Player 2: Press SPACE to Ready";
            console.log("Received Player Number, setting text:", text);

        if (this.readyText) {
            this.readyText.setText(text);
        } else {
            this.readyText = this.add.text(400, 300, text, {
                fontSize: "24px",
                fill: "#ffffff"
            }).setOrigin(0.5);
        }

        socket.on('startGame', (serverData) => {
            console.log("Game starting...");
            this.scene.start('playScene', { 
                playerNumber: this.playerNumber, 
                selectedMap: serverData.selectedMap 
            });
        });

        socket.on('full', () => {
            console.log("Game is full! Redirecting...");
            this.add.text(400, 300, "Game is full. Please wait.", {
                fontSize: "24px",
                fill: "#ff0000"
            }).setOrigin(0.5);
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.isReady) {
                this.isReady = true;
                socket.emit('playerReady');
                this.readyText.setText("Waiting for other Player...");
            }
        });

        socket.emit('resetGame');
    }
}