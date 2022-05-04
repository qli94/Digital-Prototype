class Menu extends Phaser.Scene {
    constructor() {
      super("menuScene");
    }

    preload() {
        this.load.image('city', './assets/bg.png');
        this.load.audio('hit', './assets/hit.wav');
        this.load.audio('jump', './assets/jump.wav');
        this.load.audio('shield', './assets/shield.wav');
        this.load.audio('select', './assets/select.wav');
        this.load.audio('duck', './assets/duck.wav');
        this.load.audio('slide', './assets/sliding.wav');
        this.load.audio('music', './assets/among_drip.wav');
        this.load.audio('off', './assets/shield_hit.wav');
        
    }
    create() {
        let menuConfig = {
            fontFamily: 'Alagard',
            fontSize: '90px',
            color: '#5C44C2',
            align: 'center',
            padding: {
                top: 5,
                bottom: 15,
            },
            fixedWidth: 0
        }
        
        this.cityscape = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'city').setOrigin(0);

        this.add.text(game.config.width/2, game.config.height/4, 'Forest Runner', menuConfig).setOrigin(0.5);
        menuConfig.fontSize = '40px';
        menuConfig.color = '#000000';
        this.add.text(game.config.width/2, game.config.height/1.5, 'Press LEFT to start', menuConfig).setOrigin(0.5);
        this.add.text(game.config.width/2, game.config.height/1.3, 'Press RIGHT for Credits', menuConfig).setOrigin(0.5);
        this.add.text(game.config.width/2, game.config.height/1.1, 'Press SPACE for Rules', menuConfig).setOrigin(0.5);

        // define keys
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.sound.play('select');
            this.scene.start('playScene');    
        }
        if (Phaser.Input.Keyboard.JustDown(keyRIGHT)) {
            this.sound.play('select');
            this.scene.start('creditsScene'); 
        }
        if (Phaser.Input.Keyboard.JustDown(keySPACE)) {
            this.sound.play('select');
            this.scene.start('rulesScene');
        }

    }
}