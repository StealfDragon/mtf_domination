/*
Cassian Jones
Evan Lara

Domination
*/

let config = {
    type: Phaser.AUTO,
    width: 720,
    height: 630,
    scene: [ Menu, Play ]
}

let game = new Phaser.Game(config)

let keyFIRE, keyNUKE, keySHIELD, keyMENU, keyINTERACT, keyLEFT, keyRIGHT, keyUP, keyDOWN