class GameOver extends Phaser.Scene {
    constructor() {
        super("GameOver");
    }

    create(data) {
        let winner = data.winner;
        let loser = data.loser;
        let playerNumber = data.playerNumber;

        let message = (playerNumber === winner) ? "YOU WIN!" : "YOU LOSE!";

        this.add.text(400, 250, message, {
            fontSize: '48px',
            fill: (playerNumber === winner) ? '#00ff00' : '#ff0000'
        }).setOrigin(0.5);

        let menuButton = this.add.text(400, 400, 'Return to Menu', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5).setInteractive();

        menuButton.on('pointerdown', () => {
            this.scene.start('Menu');
        });
    }
}