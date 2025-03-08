class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene")
    }

    preload() {
        this.load.image('reticle', './assets/img/TempDominationReticle.png')
        this.load.image('France', './assets/map/TempFrance.png')
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
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(keyRIGHT)) {
            console.log(Delaunator);
            console.log("switching scene")
            this.scene.start('playScene')
        }
    }
}