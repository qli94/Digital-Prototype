class Play extends Phaser.Scene {
    constructor() {
      super("playScene");
    }
    preload() {
        this.load.image('city', './assets/bg.png');
        this.load.image('city2', './assets/bg2.png');
        this.load.image('player','./assets/player.png')
        this.load.image('floor','./assets/floor.png')
        this.load.image('car','./assets/car.png')
        this.load.image('meteor','./assets/meteor.png')
        this.load.image('shield','./assets/shield.png')
       
    }

    create() { // define keys
        this.jump_sound = this.sound.add('jump');
        this.hit = this.sound.add('hit');
        this.shield_get = this.sound.add('shield');
        this.shield_off = this.sound.add('off');
        this.duck = this.sound.add('duck');
        this.slide = this.sound.add('slide');
        //this.bgm = this.sound.add('music');
        keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyDOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        
        // set some constants
        this.JUMP_VELOCITY = -1000;
        this.SCROLL_SPEED = 5;
        this.SPEED_MULT = 1;
        this.physics.world.gravity.y = 2600; 

        // background
        this.cityscape = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'city').setOrigin(0);
        // make collision groups
        this.ground = this.add.group();
        this.power = this.add.group();
        this.enemy = this.add.group();

        // create player
        this.player = this.physics.add.sprite(50, 450,  'player').setOrigin(.5,.5);

        // create shield on player
        this.trash = this.add.rectangle(50,450,20,20,'yellow');
        this.trash.alpha= 0;

        // make shield item
        this.shield = this.physics.add.sprite(-50, 200 ,  'shield').setOrigin(0);
        this.shield.body.allowGravity = false;
        this.power.add(this.shield);

        // player health
        this.p1Health = 1;

        // make ground tiles
        for(let i = 0; i < game.config.width; i += tileSize) { 
            let groundTile = this.physics.add.sprite(i, game.config.height - tileSize,  'floor').setScale(SCALE).setOrigin(0);
            let groundTile2 = this.physics.add.sprite(i, game.config.height - tileSize+10,  'floor').setScale(SCALE).setOrigin(0);
            groundTile.body.immovable = true;
            groundTile.body.allowGravity = false;
            groundTile2.body.immovable = true;
            groundTile2.body.allowGravity = false;
            groundTile.setDepth(1);
            groundTile2.setDepth(1);
            this.ground.add(groundTile);
            this.ground.add(groundTile2);
        }
        

        // create car obj
        this.car = this.physics.add.sprite(game.config.width, 455 ,  'car').setOrigin(0);
        this.hood = this.physics.add.sprite(game.config.width+30, 445 ,  'car').setOrigin(0.5,0.5);
        this.hood.setSize(50,60);
        this.hood.setDisplaySize(60,5);
        this.car.body.allowGravity = false;
        this.hood.body.allowGravity = false;
        this.hood.body.immovable = true;
        

        // meteor obj
        this.meteor =  this.physics.add.sprite(game.config.width, Math.random()*(425-380)+380,  'meteor').setOrigin(0);
        this.meteor.body.allowGravity = false;
        
        // add enemies to group
        this.enemy = this.add.group();
        this.meteors = this.add.group();
        this.enemy.add(this.car);
        this.enemy.add(this.meteor);
        this.meteors.add(this.meteor)
        
        
        
        // add physics collider
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.car, this.ground);
        this.physics.add.collider(this.shield, this.player, ()=>{
            this.shield_get.play();
            this.trash.alpha= 1;
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
            this.shield.x = -50;
            this.shield.y = 200;
            this.p1Health++;
            this.shield.body.setVelocityX(0);
            this.shield.body.setVelocityY(0);
        });
        this.physics.add.collider(this.car,  this.player, ()=>{
            this.trash.alpha= 0;
            this.car_reset();
            if(this.p1Health>1){
                this.shield_off.play();
            }else{
                this.hit.play();  
            }
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
            this.p1Health--;
        });
        this.physics.add.collider(this.meteors, this.player, ()=>{
            this.trash.alpha= 0;
            this.meteor_reset();
            if(this.p1Health>1){
                this.shield_off.play();
            }else{
                this.hit.play();  
            }
            
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
            this.p1Health--;
        });
        this.physics.add.collider(this.player, this.hood, ()=>{
            this.player.body.setVelocityY(0);
            this.player.body.setVelocityX(-1*this.hood.body.velocity.x+300);
        });

        // game over variable 
        this.gameOver = false;
        

        // starting vel for enemy objs
        this.car.body.setVelocityX(-300);
        this.hood.body.setVelocityX(-300);
        this.meteor.body.setVelocityX(-400);

        // text config
        let textConfig = {
            fontFamily: 'Alagard',
            fontSize: '40px',
            color: '#000000',
            align: 'center',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        }
        let dropshadow = {
            fontFamily: 'Alagard',
            fontSize: '40px',
            color: '#505050',
            align: 'center',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        }
        

        // SCORING
        this.score = 0;
        this.scoreRightDropshadow = this.add.text(12, 12, "Distance: "+this.score+" mi", dropshadow).setOrigin(0);
        this.scoreRight = this.add.text(10, 10, "Distance: "+this.score+" mi", textConfig).setOrigin(0);
        this.time.addEvent({ delay: 2500, callback: this.miles, callbackScope: this, loop: true });

        if(highScore>=0){
            this.highScoreShadow = this.add.text(game.config.width-8, 12, "High Score: "+highScore+" mi", dropshadow).setOrigin(1,0);
            this.highScoreDisplay = this.add.text(game.config.width-10, 10, "High Score: "+highScore+" mi", textConfig).setOrigin(1,0);

        // powerup spawn
        this.time.addEvent({ delay: 10000, callback: this.shieldSpawn, callbackScope: this, loop: true });
        }


        this.scene2 = this.time.delayedCall(15000, () => {
            this.player.setDepth(1);
            this.meteor.setDepth(1);
            this.car.setDepth(1);
            this.hood.setDepth(1);
            this.shield.setDepth(1);
            this.trash.setDepth(1);
            this.scoreRightDropshadow.setDepth(1);
            this.scoreRight.setDepth(1);
            this.highScoreShadow.setDepth(1);
            this.highScoreDisplay.setDepth(1);
            this.cityscape.setDepth(0);
            this.cityscape = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'city2').setOrigin(0);
            this.cityscape.setDepth(0);
            this.SCROLL_SPEED +=10;
            this.SPEED_MULT = 2;
            }, null, this);
            this.state="behind"

    }

        
    update() {
        console.log("Player X \: "+this.player.x);
        // update tile sprites (tweak for more "speed")

        // game ending handling
        if(this.gameOver){
            //this.bgm.setLoop(false);
        //this.bgm.stop();
            if(this.score>highScore){
                highScore = this.score;
            }
            this.scene.start('menuScene');
        }


        // what to do in game runtime
        if(!this.gameOver){
                
            //make bg scroll
            this.cityscape.tilePositionX += this.SCROLL_SPEED; 
            //this.groundTile += this.SCROLL_SPEED;

            //check for player touching ground
            this.player.onGround = this.player.body.touching.down;

            // FIXME: player position can exceed 50 if ducking while velocity.x > 0

            if(this.player.x<50){
                this.state = "behind";
            
            }else if(this.player.x>70){
               this.state = "ahead";
            }
            else{
                this.state = "zone";
            }
            
            if(this.player.onGround){
                this.jump = 1;
                this.jumping=false;
                
                
            
            }
         
            switch(this.state){
                case "behind":
                    this.player.body.velocity.x =20;
                    break;
                case "ahead":
                    this.player.body.velocity.x =-20;
                    break;
                case "zone":
                    this.player.body.velocity.x = 0;

            }
          
            


            // jumping controller
            if(this.jump>0 && Phaser.Input.Keyboard.DownDuration(keyUP,100)&&!keyDOWN.isDown) {
                // console.log("I JUMPED POGGERS");
                this.jump_sound.play();
                this.player.body.setVelocityY(-800);
                this.jumping=true;
            }
            if(this.jumping && keyDOWN.isUp) {
                // console.log("LET GO OF SPCACE");
                this.jump--;
                this.jumping = false;
            }


            // reset things when they go off screen
            if(this.car.body.x <-200){
                // console.log("OFFSCREEN XD"); 
                this.car_reset();
            }
            
            if(this.meteor.body.x <-200||this.meteor.body.velocity.x==0){
                // console.log("OFFSCREEN XD"); 
                this.meteor_reset();
            }
            
            if((this.meteor.tilePositionX-this.car.tilePositionX)>-100||(this.car.tilePositionX-this.meteor.tilePositionX)>-100){
                this.meteor.body.velocity.x+=30;
            }

            // controlling the sliding
            if(keyDOWN.isDown){
                if(Phaser.Input.Keyboard.JustDown(keyDOWN)){
                   this.duck.play(); 
                this.slide.setLoop(true);
                this.slide.play();
                }
                
                this.player.angle = 90;
                this.player.setSize(65,40);
                this.player.setDisplaySize(45,70);
                
                if(!this.jumping){
                // this.player.y = 467.5;
                this.player.body.setVelocityY(700);
                }
            }


            // resetting after done sliding
            if(Phaser.Input.Keyboard.JustUp(keyDOWN)||this.player.y>game.config.height){
                this.slide.setLoop(false);
                this.slide.stop();
                this.player.body.setVelocityY(0);
                this.player.angle = 0;
                this.player.y = 450;
                this.player.setSize(40,65);
                this.player.setDisplaySize(45,70);

            }
            

            // take of shield if player is hit
            if(this.p1Health>1){
                this.trash.x = this.player.x;
                this.trash.y = this.player.y;

            }

            //when player health reaches 0 or off screen end the game
            if(this.p1Health <= 0||this.player.x<-30){
                this.slide.setLoop(false);
                this.gameOver = true;
            }
        }  

    }


    // updates the score 
    miles(){
        this.score +=.5;
        this.scoreRight.text = "Distance: "+this.score + " mi";
        this.scoreRightDropshadow.text = "Distance: "+this.score + " mi";
    }


    // spawn the shield
    shieldSpawn(){
        if(this.p1Health==1&&this.shield.x<0){
            this.shield.x = game.config.width + 50;
            this.shield.y =  Math.random()*(600-400)+400
            this.shield.body.setVelocityX(-200);
            this.shield.body.setVelocityY(0);
        }
    }


    // reset the meteor 
    meteor_reset(){
        this.meteor.destroy();
        this.meteor =  this.physics.add.sprite(game.config.width, Math.random()*(425-380)+380,  'meteor').setOrigin(0);
        this.meteor.body.allowGravity = false;
        this.meteor.x = game.config.width+50;
        this.meteor.setVelocityY(0);
        this.meteor.setVelocityX((-1*((Math.random()*(500-400)+400)))*this.SPEED_MULT);
        this.meteor.y = Math.random()*(425-380)+380;
        this.meteors.add(this.meteor);

    }


    //reset the car
    car_reset(){
        this.car.x = game.config.width+50;
        this.num = (-1*((Math.random()*(500-300)+300)))*this.SPEED_MULT;
        this.car.body.setVelocityX(this.num);
        this.hood.x = this.car.x+30;
        this.hood.body.setVelocityX(this.num);

    }

}