class GalleryImp extends Phaser.Scene {
    constructor() {
        super("galleryImp");

        // Initialize a class variable "my" which is an object.
        // The object has two properties, both of which are objects
        //  - "sprite" holds bindings (pointers) to created sprites
        //  - "text"   holds bindings to created bitmap text objects
        this.my = {sprite: {}, text: {}};

        // Create a property inside "sprite" named "bullet".
        // The bullet property has a value which is an array.
        // This array will hold bindings (pointers) to bullet sprites
       
        //this.my.sprite.bullet = [];   
        //this.maxBullets = 5;           // Don't create more than this many bullets
        
        this.bulletCooldown = 25;        // Number of update() calls to wait before making a new bullet
        this.bulletCooldownCounter = 0;
        this.bulletCooldownCounter2 = 0;
        this.gameStart = 180;

        this.dashCooldown = 180;
        this.dashCooldownTimer = 0; 
        this.dashDistance = 150;   

        this.playerAlive = true;

        this.myScore = 0;       // record a score as a class variable
        // More typically want to use a global variable for score, since
        // it will be used across multiple scenes

        this.cowFollow = false;
        this.cowNumber = 0;
        this.cowCooldown = Phaser.Math.Between(60, 120);

        this.enemies = 6;
        this.start = 100;
        this.start2 = 50;
        this.spacing = 150;
        this.spacing2 = 180;
        this.row1 = 120;
        this.row2 = 200;

        this.playerHealth = 3;
        this.dead = 0;
        this.clicked = false;
        this.level = 9000;
        this.levelFont = 1;


    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("alienBlue", "alienBlue.png");
        this.load.image("snake", "snake.png");
        this.load.image("moose", "moose.png");
        this.load.image("cow", "cow.png");
        this.load.image("pig", "pig.png");

        // For animation
        this.load.image("whitePuff00", "whitePuff00.png");
        this.load.image("whitePuff01", "whitePuff01.png");
        this.load.image("whitePuff02", "whitePuff02.png");
        this.load.image("whitePuff03", "whitePuff03.png");

        // Load the Kenny Rocket Square bitmap font
        // This was converted from TrueType format into Phaser bitmap
        // format using the BMFont tool.
        // BMFont: https://www.angelcode.com/products/bmfont/
        // Tutorial: https://dev.to/omar4ur/how-to-create-bitmap-fonts-for-phaser-js-with-bmfont-2ndc
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        // Sound asset from the Kenny Music Jingles pack
        // https://kenney.nl/assets/music-jingles
        this.load.audio("dadada", "jingles_NES13.ogg");
    }

    create() {
        let my = this.my;

        
        this.points = [
            -20, -20,
            500, 500,
            20, 700,
            -100, -20,
            -20, -20
        ];
        this.curve = new Phaser.Curves.Spline(this.points);

        this.secondPoints = [
            -20, -20,
            -450, 350,
            -700, 250,
            -20, -20
        ];
        this.secondCurve = new Phaser.Curves.Spline(this.secondPoints);

        // Initialize Phaser graphics, used to draw lines
        this.graphics = this.add.graphics();


        my.sprite.alienBlue = new Player(this, game.config.width/2, game.config.height - 40, "alienBlue", null,
            this.left, this.right, 5);
        my.sprite.alienBlue.setScale(1);

        //my.sprite.moose = this.add.sprite(game.config.width/2, 80, "moose");
        //my.sprite.moose.setScale(.45);
        //my.sprite.moose.scorePoints = 25;

        // Notice that in this approach, we don't create any bullet sprites in create(),
        // and instead wait until we need them, based on the number of space bar presses
        
        my.sprite.bulletGroup = this.add.group({
            active: true,
            defaultKey: "snake",
            maxSize: 10,
            runChildUpdate: true,
            }
        )

        my.sprite.enemyBullet = this.add.group({
            active: true,
            defaultKey: "pig",
            maxSize: 50,
            runChildUpdate: true,
            }
        )

        // Create white puff animation
        this.anims.create({
            key: "puff",
            frames: [
                { key: "whitePuff00" },
                { key: "whitePuff01" },
                { key: "whitePuff02" },
                { key: "whitePuff03" },
            ],
            frameRate: 25,    // Note: case sensitive (thank you Ivy!)
            repeat: 5,
            hideOnComplete: true
        });

        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // Set movement speeds (in pixels/tick)
        this.playerSpeed = 6;
        this.bulletSpeed = 12;
        this.CowBulletSpeed = 8;

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>Revenge of the Cute Animals</h2><br>A: left // D: right // Space: fire/emit // E: Dash';

        my.sprite.enemyGroup = this.add.group();
        my.sprite.cowGroup = this.add.group();

        for( let i = 0; i < this.enemies; i++) {
            if(this.cowNumber < 3){
                let cow = this.add.follower(this.curve, this.start2 + i * this.spacing2, this.row1, "cow");
                cow.setScale(0.5);
                cow.scorePoints = 50;
                cow.key = "cow";

                my.sprite.enemyGroup.add(cow);
                my.sprite.cowGroup.add(cow);

                this.cowNumber++;
            } else {
                let cow = this.add.follower(this.secondCurve, this.start2 + i * this.spacing2, this.row1, "cow");
                cow.setScale(0.5);
                cow.scorePoints = 50;
                cow.key = "cow";

                my.sprite.enemyGroup.add(cow);
                my.sprite.cowGroup.add(cow);
            }
        }

        for( let i = 0; i < this.enemies; i++) {
            let moose = this.add.sprite(this.start + i * this.spacing, this.row2, "moose");
            moose.setScale(0.35);
            moose.scorePoints = 25;
            moose.key = "moose";
            moose.down = true;

            my.sprite.enemyGroup.add(moose);
        }


        my.sprite.bulletGroup.createMultiple({
            classType: Bullet,
            active: false,
            key: my.sprite.bulletGroup.defaultKey,
            repeat: my.sprite.bulletGroup.maxSize-1
        });

        let bullets = my.sprite.bulletGroup.getChildren();
        
        for(let i = 0; i < bullets.length; i++) {
            bullets[i].makeInactive();
        }


        my.sprite.bulletGroup.propertyValueSet("speed", this.bulletSpeed);

        my.sprite.enemyBullet.createMultiple({
            classType: CowBullet,
            active: false,
            key: my.sprite.enemyBullet.defaultKey,
            repeat: my.sprite.enemyBullet.maxSize-1
        });

        let enemyCowBullets = my.sprite.enemyBullet.getChildren();

        for(let i = 0; i < enemyCowBullets.length; i++) {
            enemyCowBullets[i].makeInactive();
        }

        my.sprite.bulletGroup.propertyValueSet("speed", this.CowBulletSpeed);

        // Put score on screen
        my.text.score = this.add.bitmapText(680, 0, "rocketSquare", "Score " + this.myScore);

        my.text.health = this.add.bitmapText(880, 750, "rocketSquare", "HP: " + this.playerHealth);

        my.text.levelNum = this.add.bitmapText(150, 0, "rocketSquare", "LEVEL: " + this.levelFont);
        
        // Put title on screen
        this.add.text(10, 5, "Revenge of the Cute Animals!", {
            fontFamily: 'Times, serif',
            fontSize: 24,
            wordWrap: {
                width: 120
            }
        });

        my.text.helloButton = this.add.text(385, 500, 'Continue', {fontSize: 38});
        my.text.helloButton.setInteractive({ useHandCursor: true });
        my.text.helloButton.on('pointerdown', () => this.init_game()); 
        my.text.helloButton.visible = false;

        my.text.winText = this.add.text(380, 400, "You Win!", {
            fontFamily: 'Times, serif',
            fontSize: 48,
        });
        my.text.winText.visible = false;

        my.text.GameOver = this.add.text(360, 400, "Game Over!", {
            fontFamily: 'Times, serif',
            fontSize: 48,
        });
        my.text.GameOver.visible = false;

        my.text.Retry = this.add.text(405, 500, 'retry', {fontSize: 38});
        my.text.Retry.setInteractive({ useHandCursor: true });
        my.text.Retry.on('pointerdown', () => this.init_game()); 
        my.text.Retry.visible = false;

        my.text.dash = this.add.text(10, 760, "DASH AVAILABLE!", {
            fontFamily: 'Times, serif',
            fontSize: 24,
        });
        my.text.dash.visible = false;


    }

    update() {
        let my = this.my;
        this.bulletCooldownCounter--;
        this.cowCooldown--;
        this.gameStart--;

        if (this.dashCooldownTimer > 0) {
            this.dashCooldownTimer--;
        }

        if(this.dashCooldownTimer <= 0){
            this.my.text.dash.visible = true;
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.dashKey) && this.dashCooldownTimer <= 0 && this.playerAlive) {
            if (this.left.isDown) {
                
                my.sprite.alienBlue.x -= this.dashDistance;
                my.text.dash.visible = false;

            } else if (this.right.isDown) {
                
                my.sprite.alienBlue.x += this.dashDistance;
                my.text.dash.visible = false;

            }
            this.dashCooldownTimer = this.dashCooldown;
        }

        // Moving left
        if (this.left.isDown) {
            // Check to make sure the sprite can actually move left
            if (my.sprite.alienBlue.x > (my.sprite.alienBlue.displayWidth/2)) {
                my.sprite.alienBlue.x -= this.playerSpeed;
            }
        }


        // Moving right
        if (this.right.isDown) {
            // Check to make sure the sprite can actually move right
            if (my.sprite.alienBlue.x < (game.config.width - (my.sprite.alienBlue.displayWidth/2))) {
                my.sprite.alienBlue.x += this.playerSpeed;
            }
        }

        if(this.gameStart < 60){
            if (this.space.isDown && this.playerAlive == true) {
                if (this.bulletCooldownCounter < 0) {
                    // Get the first inactive bullet, and make it active
                    let bullet = my.sprite.bulletGroup.getFirstDead();
                    // bullet will be null if there are no inactive (available) bullets
                    if (bullet != null) {
                        this.bulletCooldownCounter = this.bulletCooldown;
                        bullet.makeActive();
                        bullet.x = my.sprite.alienBlue.x;
                        bullet.y = my.sprite.alienBlue.y - (my.sprite.alienBlue.displayHeight/2);
                        
                    }
                }
            }
            if (this.cowCooldown < 0) {
                for (let cow of my.sprite.cowGroup.getChildren()) {
                    if (cow.active) {
                        let enemyCowBullet = my.sprite.enemyBullet.getFirstDead();
                        if (enemyCowBullet) {
                            enemyCowBullet.makeActive();
                            enemyCowBullet.x = cow.x;
                            enemyCowBullet.y = cow.y + (cow.displayHeight / 2);
                        }
                    }
                }
                this.cowCooldown = Phaser.Math.Between(60, 120);
            }
        }


        if(this.dead >= 12){
            my.text.helloButton.visible = true;
            my.text.winText.visible = true;
            this.dead = 0;
            this.won = true;
        }    

        if (this.gameStart < 60){
            for(let enemy of my.sprite.cowGroup.getChildren()) {
                if (enemy.key == "moose"){
                    enemy.setScale(0.5);
                }
            }
        }

        if (this.gameStart < 0) {
            for (let enemy of my.sprite.enemyGroup.getChildren()) {
                if (enemy.key == "moose") {
                    if (enemy.down == true) {

                        enemy.y += 8;
                        enemy.setScale(0.5)
                        if (enemy.y >= game.config.height - 20) {
                            enemy.down = false;
                        }
                    } else {
                        enemy.y -= 8;
                        enemy.setScale(0.35)
                        if (enemy.y <= 200) {
                            enemy.down = true;
                        }
                    }
                }
            }
        }

        for (let enemy of my.sprite.enemyGroup.getChildren()) {
            if (enemy.active && this.collides(enemy, my.sprite.alienBlue)) {
                
                if (this.playerAlive && this.playerHealth > 0){
                    this.playerHealth -= 1;
                    this.updateHealth();
        
                    if (this.playerHealth <= 0) {
                        this.updateHealth();
                        this.playerHealth = 0;
                        my.text.GameOver.visible = true;
                        my.text.Retry.visible = true;
                        this.playerSpeed = 0;
                        this.playerAlive = false;
                    }
                }
                this.updateHealth();
            }
            
        }

        for(let bullet of my.sprite.enemyBullet.getChildren()) {
            if (bullet.active && this.collides(bullet, my.sprite.alienBlue)) {
                bullet.makeInactive();
        
                if (this.playerAlive && this.playerHealth > 0){
                    this.playerHealth -= 1;
                    this.updateHealth();
        
                    if (this.playerHealth <= 0) {
                        this.updateHealth();
                        this.playerHealth = 0;
                        my.text.GameOver.visible = true;
                        my.text.Retry.visible = true;
                        this.playerSpeed = 0;
                        this.playerAlive = false;
                    }
                }
                this.updateHealth();
            }
        }
        
        if(!this.cowFollow && this.gameStart < 30) {
            for (let cow of my.sprite.cowGroup.getChildren()) {
                if (cow.key == "cow") {
                    cow.startFollow({
                        from: 0,
                        to: 1,
                        delay: 2000,
                        duration: 9000,
                        ease: 'Sine.easeInOut',
                        repeat: -1,
                        yoyo: true,
                        rotateToPath: true,
                        rotationOffset: -90
                    });
                }
            }
            this.cowFollow = true;
        }

        for (let bullet of my.sprite.bulletGroup.getChildren()){
            for (let enemy of my.sprite.enemyGroup.getChildren()) {
                if (enemy.active && bullet.active && this.collides(enemy, bullet)) {
                    this.puff = this.add.sprite(enemy.x, enemy.y, "whitePuff03").setScale(0.25).play("puff");
                    bullet.makeInactive();

                    
                    enemy.active = false;
                    enemy.visible = false;
                    enemy.x = -1000;

                    this.dead += 1;
    
                    this.myScore += enemy.scorePoints;
                    this.updateScore();
    
                    this.sound.play("dadada", { volume: 0.01 });
    
                    this.puff.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                        my.sprite.moose.visible = true;
                        enemy.x = Math.random() * game.config.width;
                    }, this);
                }
            }
        }
    }

    

    updateScore() {
        this.my.text.score.setText("Score " + this.myScore);
    }

    updateHealth() {
        this.my.text.health.setText("HP: " + this.playerHealth);
    }

    updateLevel() {
        this.my.text.levelNum.setText("LEVEL: " + this.levelFont);
    }

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth / 2 + b.displayWidth / 2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight / 2 + b.displayHeight / 2)) return false;
        return true;
    }

    //init_game() {

        //if (this.won != true){
            //this.myScore = 0;
            //this.my.text.score.setText("Score " + this.myScore);

            //this.my.text.GameOver.visible = false;
            //this.my.text.Retry.visible = false;
            //this.playerSpeed = 6;
        //} else {
            //this.my.text.helloButton.visible = false;
            //this.my.text.winText.visible = false;
        //}
         
    //}

    
    
    init_game() {
        let my = this.my;
        this.playerAlive = true;
    
        if (this.won != true) {
            this.myScore = 0;
            my.text.score.setText("Score " + this.myScore);
            my.text.GameOver.visible = false;
            my.text.Retry.visible = false;
            this.levelFont = 1;
        } else {
            my.text.helloButton.visible = false;
            my.text.winText.visible = false;
            this.level -= 250;
            this.levelFont++;
        }
    
        this.dead = 0;
        this.gameStart = 180;
        this.bulletCooldownCounter = 0;
        this.bulletCooldownCounter2 = 0;
        this.playerSpeed = 6;
        this.cowFollow = true;
        this.won = false;
        this.playerHealth = 3;
        this.updateHealth();
        this.updateLevel();
    
        let cowNum = 0;
        let mooseNum = 0;
    
        for (let enemy of my.sprite.enemyGroup.getChildren()) {
            enemy.active = true;
            enemy.visible = true;
    
            if (enemy.key == "cow") {
                enemy.stopFollow();
                if (cowNum < 3) {
                    enemy.setPath(this.curve);
                } else {
                    enemy.setPath(this.secondCurve);
                }
                enemy.setPosition(this.start2 + cowNum * this.spacing2, this.row1);
    
                enemy.startFollow({
                    from: 0,
                    to: 1,
                    delay: 2000,
                    duration: this.level,
                    ease: 'Sine.easeInOut',
                    repeat: -1,
                    yoyo: true,
                    rotateToPath: true,
                    rotationOffset: -90
                });
    
                cowNum++;
            } else if (enemy.key == "moose") {
                enemy.setPosition(this.start + mooseNum * this.spacing, this.row2);
                mooseNum++;
            }
        }
    }
    

}
