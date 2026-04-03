export default class Level1 extends Phaser.Scene {
    constructor() {
        super('Level1');
    }

    create() {
        this.score = 0;
        this.gameTime = 0;
        this.levelDuration = 60000; // 60 seconds
        this.isLevelOver = false;
        this.lastFired = 0;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background (Tiling Sprite for infinite auto-scrolling)
        this.bg = this.add.tileSprite(0, 0, width, height, 'bg_cropped')
            .setOrigin(0, 0)
            .setScrollFactor(0); // Will handle scroll manually

        // Adjust bg scale based on the original texture height to maintain exact proportions
        const textureHeight = this.textures.get('bg_cropped').getSourceImage().height;
        const bgScale = height / textureHeight;
        this.bg.tileScaleX = bgScale;
        this.bg.tileScaleY = bgScale;

        // Create player
        this.player = this.physics.add.sprite(width * 0.2, height * 0.5, 'player_sprite_trans');
        
        // Scale player to a reasonable size (e.g., 200x200)
        const faceScale = 200 / Math.max(this.player.width, this.player.height);
        this.player.setScale(faceScale);
        
        // Circular physics body
        this.player.setCircle(this.player.width / 2);
        this.player.setCollideWorldBounds(true);
        // Reduce bounding box gravity so it can float/jump easily
        this.player.body.setGravityY(0);



        // Bullets group
        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 30
        });

        // Dinosaurs group
        this.dinos = this.physics.add.group();

        // Collisions
        this.physics.add.overlap(this.bullets, this.dinos, this.hitDino, null, this);

        // Spawn timer for dinosaurs
        this.time.addEvent({
            delay: 1500, // spawn every 1.5 seconds
            callback: this.spawnDino,
            callbackScope: this,
            loop: true
        });
    }

    spawnDino() {
        if (this.isLevelOver) return;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Random Y position in lower half of screen
        const spawnY = Phaser.Math.Between(height * 0.3, height * 0.8);
        
        const dino = this.dinos.create(width + 100, spawnY, 'dino_trans');
        
        // Scale the dino (e.g. 300x300)
        const dinoScale = 300 / Math.max(dino.width, dino.height);
        dino.setScale(dinoScale);
        
        dino.body.setAllowGravity(false);
        dino.setVelocityX(-200); // Move left
        dino.isFrozen = false;
        
        // Check bounds manually to destroy if it goes off left edge
        dino.setCollideWorldBounds(false); 
    }

    hitDino(bullet, dino) {
        if(dino.isFrozen) return; // Already frozen

        if (bullet.emitter) {
            bullet.emitter.stop();
            this.time.delayedCall(500, () => { if (bullet.emitter) bullet.emitter.destroy(); });
        }
        bullet.destroy(); // bullet disappears

        dino.isFrozen = true;
        dino.setVelocityX(0); // Stop moving
        dino.setTint(0x00ffff); // Ice blue tint
        
        // Update score
        this.score += 10;
        document.getElementById('score').innerText = this.score;
    }

    update(time, delta) {
        if (this.isLevelOver) return;

        this.gameTime += delta;
        if (this.gameTime >= this.levelDuration) {
            this.endLevel();
            return;
        }

        // --- Auto Scroll Background ---
        this.bg.tilePositionX += 2; // scroll speed

        // --- Player Controls ---
        const speed = 300;
        const input = window.gameInput;
        
        this.player.setVelocity(0);
        
        if (input.left) {
            this.player.setVelocityX(-speed);
        } else if (input.right) {
            this.player.setVelocityX(speed);
        }
        
        if (input.up) {
            this.player.setVelocityY(-speed);
        } else if (input.down) {
            this.player.setVelocityY(speed);
        }


        
        // Handle shooting
        if (input.fire && time > this.lastFired) {
            this.fireBullet();
            this.lastFired = time + 800; // Fire rate limit 800ms
        }

        // Cleanup off-screen dinosaurs and bullets
        this.dinos.children.iterate((dino) => {
            if (dino && dino.x < -100) {
                dino.destroy();
            } else if (dino && dino.isFrozen) {
                // Keep frozen dinosaurs moving at scrolling speed so they disappear left
                dino.x -= 2; 
            }
        });

        this.bullets.children.iterate((bullet) => {
            if (bullet && bullet.x > this.cameras.main.width + 50) {
                if (bullet.emitter) {
                    bullet.emitter.stop();
                    this.time.delayedCall(500, () => { if (bullet.emitter) bullet.emitter.destroy(); });
                }
                bullet.destroy();
            }
        });
    }

    fireBullet() {
        // Bullet comes from the character's extended arm
        const bullet = this.bullets.get(this.player.x + 40, this.player.y + 10);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.setAllowGravity(false);
            bullet.setVelocityX(600); // Shoot right
            
            // Re-create or reuse the particle emitter
            if (bullet.emitter) {
                bullet.emitter.destroy();
            }
            
            bullet.emitter = this.add.particles(0, 0, 'ice-particle', {
                speed: { min: -50, max: 50 },
                scale: { start: 1, end: 0 },
                alpha: { start: 0.8, end: 0 },
                lifespan: 400,
                blendMode: 'ADD'
            });
            bullet.emitter.startFollow(bullet);
        }
    }

    endLevel() {
        this.isLevelOver = true;
        this.physics.pause();
        
        // Show Level Complete UI
        const gameOverDiv = document.getElementById('game-over');
        gameOverDiv.style.display = 'block';
        document.getElementById('final-score').innerText = (this.score / 10).toString();
        document.getElementById('final-points').innerText = this.score.toString();
        document.getElementById('controls').style.display = 'none'; // hide touch controls
    }
}
