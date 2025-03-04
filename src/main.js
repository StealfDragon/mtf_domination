/*
Cassian Jones
Evan Lara

Domination
*/

let config = {
    type: Phaser.AUTO,
    width: 1080,
    height: 540,
    scene: [ Menu, Play ]
}

let game = new Phaser.Game(config)

let keyFIRE, keyNUKE, keySHIELD, keyMENU, keyLEFT, keyRIGHT