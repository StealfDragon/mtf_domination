class GameOver extends Phaser.Scene {
    constructor() {
        super("GameOver");
    }

    create(data) {
        let winner = data.winner;
        let playerNumber = data.playerNumber;

        let message = (playerNumber === winner) ? "YOU WIN!" : "YOU LOSE!";

        this.add.text(400, 250, message, {
            fontSize: '48px',
            fill: (playerNumber === winner) ? '#00ff00' : '#ff0000'
        }).setOrigin(0.5);

        // Add return prompt
        this.readyText = this.add.text(400, 350, "Press SPACE to go to Menu", {
            fontSize: "24px",
            fill: "#ffffff"
        }).setOrigin(0.5);

        // Handle spacebar input to return to menu
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('Menu'); // Go back to the Menu scene
        });
    }
}