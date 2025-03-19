/*

DOMINATION

-Cassian Jones
-Evan Lara

Credits: Used some code (not even sure if any of it left so may be more inspiration) from Jerome Renaux

Stuff For Assignment Credit:
Phaser Components Used:


Tilt Part:
Non-Local Multiplayer
*/

let config = {
    type: Phaser.AUTO,
    width: 1440,
    height: 630,
    scene: [ Menu, Play ]
}

let game = new Phaser.Game(config)

let keyFIRE, keyNUKE, keySHIELD, keyMENU, keyINTERACT, keyLEFT, keyRIGHT, keyUP, keyDOWN