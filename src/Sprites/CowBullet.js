class CowBullet extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {        
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        this.visible = false;
        this.active = false;
        this.angle = 90;
        this.setScale(0.35);
        this.speed = 10;
        return this;
    }

    update() {
        if (this.active) {
            this.y += this.speed;
            if (this.y > game.config.height + this.displayHeight) {
                this.makeInactive();
            }
        }
    }

    makeActive() {
        this.visible = true;
        this.active = true;
    }

    makeInactive() {
        this.visible = false;
        this.active = false;
        this.y = -100;
    }

}