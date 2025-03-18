/*
Cassian Jones
Evan Lara

Domination
*/

import Play from './src/scenes/Play.js';

let config = {
    type: Phaser.AUTO,
    width: 1440,
    height: 630,
    scene: [ Menu, Play ]
}

let game = new Phaser.Game(config)

let keyFIRE, keyNUKE, keySHIELD, keyMENU, keyINTERACT, keyLEFT, keyRIGHT, keyUP, keyDOWN