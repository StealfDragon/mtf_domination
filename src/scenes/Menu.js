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
        });

        socket.on('startGame', () => {
            console.log("Game starting...");

            this.triangleHits = {};

            this.score = 0;
            this.scoreText.setText('Score: 0');

            this.scene.start('playScene', { playerNumber: this.playerNumber });
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
    }
}