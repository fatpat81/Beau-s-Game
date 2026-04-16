export default class Level extends Phaser.Scene {
    constructor() {
        super('Level');
    }

    init(data) {
        this.currentLevel = data.level || 1;
        this.score = data.score || 0;
    }

    create() {
        // Ensure UI is visible (it was hidden in TitleScene)
        const uiLayer = document.getElementById('ui-layer');
        if (uiLayer) uiLayer.style.display = 'block';
        const controls = document.getElementById('controls');
        if (controls) controls.style.display = 'flex';
        const gameOverDiv = document.getElementById('game-over');
        if (gameOverDiv) gameOverDiv.style.display = 'none';

        this.gameTime = 0;
        this.levelDuration = 45000; // 45 seconds
        this.isLevelOver = false;
        this.lastFired = 0;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const bgKeys = [
            '',
            'bg_cropped',
            'bg_level2_woodland',
            'bg_level3_desert_cropped',
            'bg_level4_arctic_cropped',
            'bg_level5_toxic_cropped',
            'bg_level6_volcanic_cropped',
            'bg_level7_crystal_cropped',
            'bg_level8_ruins_cropped',
            'bg_level9_underwater_cropped',
            'bg_level10_space_cropped',
            'bg_level11_cyber_cropped'
        ];
        
        let bgKey = bgKeys[this.currentLevel] || 'bg_cropped';

        // Background
        this.bg = this.add.tileSprite(0, 0, width, height, bgKey)
            .setOrigin(0, 0)
            .setScrollFactor(0);

        try {
            const textureHeight = this.textures.get(bgKey).getSourceImage().height;
            const bgScale = height / textureHeight;
            this.bg.tileScaleX = bgScale;
            this.bg.tileScaleY = bgScale;
        } catch(e) {
            console.error("Scale error on bg:", e);
        }

        // Create player
        this.player = this.physics.add.sprite(width * 0.2, height * 0.5, 'player_sprite_trans');
        
        const faceScale = 200 / Math.max(this.player.width, this.player.height);
        this.player.setScale(faceScale);
        
        this.player.setCircle(this.player.width / 2);
        this.player.setCollideWorldBounds(true);
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

        // Spawn timer (Reduced spawns by 60% by increasing delay 2.5x)
        this.time.addEvent({
            delay: Math.max(3750 - (this.currentLevel * 250), 1250), // Gets faster each level, but less frequent
            callback: this.spawnDino,
            callbackScope: this,
            loop: true
        });

        document.getElementById('score').innerText = this.score;
    }

    spawnDino() {
        if (this.isLevelOver) return;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const spawnY = Phaser.Math.Between(height * 0.3, height * 0.8);
        
        const dinoKeys = [
            'dino_trans', 
            'dino_trex_trans', 
            'dino_triceratops_trans', 
            'dino_stegosaurus_trans', 
            'dino_pterodactyl_trans', 
            'dino_velociraptor_trans'
        ];
        
        let randomDinoKey = dinoKeys[Math.floor(Math.random() * dinoKeys.length)];
        let isRob = false;

        // Level 8 custom logic: spawn the Rob Dinosaur occasionally
        if (this.currentLevel === 8 && Math.random() < 0.3) {
            randomDinoKey = 'dino_rob_trans'; // Using actual Dino Rob sprite
            isRob = true;
        }

        const dino = this.dinos.create(width + 100, spawnY, randomDinoKey);
        dino.isRob = isRob;
        if (isRob) {
            // Play Rob's basic walk
            try { dino.play('dino_rob_trans_walk'); } catch(e) {}
        } else {
            try { dino.play(`${randomDinoKey}_walk`); } catch(e) {}
        }
        
        const dinoScale = 300 / Math.max(dino.width, dino.height);
        dino.setScale(dinoScale);
        
        dino.body.setAllowGravity(false);
        dino.setVelocityX(-200 - (this.currentLevel * 10)); // Move left, faster each level
        
        dino.setCollideWorldBounds(false); 
    }

    hitDino(bullet, dino) {
        if (bullet.emitter) {
            bullet.emitter.stop();
            this.time.delayedCall(500, () => { if (bullet.emitter) bullet.emitter.destroy(); });
        }
        bullet.destroy(); 

        if (dino.isRob) {
            // Mud explosion for Dino Rob (200% bigger)
            const mud = this.add.particles(dino.x, dino.y, 'ice-particle', {
                speed: { min: -300, max: 300 },
                angle: { min: 0, max: 360 },
                scale: { start: 12, end: 0 },
                alpha: { start: 1, end: 0.5 },
                tint: 0x654321, // Mud color
                lifespan: 800,
                blendMode: 'NORMAL',
                emitting: false
            });
            mud.explode(60);
        } else {
            // Normal ice explosion (200% bigger)
            const explosion = this.add.particles(dino.x, dino.y, 'ice-particle', {
                speed: { min: -400, max: 400 },
                angle: { min: 0, max: 360 },
                scale: { start: 9, end: 0 },
                alpha: { start: 1, end: 0 },
                lifespan: 600,
                blendMode: 'ADD',
                emitting: false
            });
            explosion.explode(40);
        }

        dino.destroy(); // Destroy dino completely
        
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

        this.bg.tilePositionX += 1.2 + (this.currentLevel * 0.3); // 40% slower background scroll

        const speed = 400; // Original player speed
        const input = window.gameInput;
        
        this.player.setVelocity(0);
        
        // Player movement and animation
        let isMoving = false;
        
        if (input.left) {
            this.player.setVelocityX(-speed);
            isMoving = true;
        } else if (input.right) {
            this.player.setVelocityX(speed);
            isMoving = true;
        }
        
        if (input.up) {
            this.player.setVelocityY(-speed);
            isMoving = true;
        } else if (input.down) {
            this.player.setVelocityY(speed);
            isMoving = true;
        }
        
        try {
            if (isMoving) {
                this.player.play('player_walk', true);
            } else {
                this.player.stop();
            }
        } catch(e) {}
        
        if (input.fire && time > this.lastFired) {
            this.fireBullet();
            this.lastFired = time + 600; 
        }

        this.dinos.children.iterate((dino) => {
            if (dino) {
                // Removed dinosaur full-sprite shake per request
                
                if (dino.x < -200) {
                    dino.destroy();
                }
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
        // Adjust coordinate so it looks like it shoots from the extended arm
        const offsetX = this.player.width * this.player.scaleX * 0.4;
        const offsetY = 0; // The arm is roughly in the center vertically, tweak if needed
        const bullet = this.bullets.get(this.player.x + offsetX, this.player.y + offsetY);
        
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.setAllowGravity(false);
            bullet.setVelocityX(800); // Original bullet speed
            
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
        
        const gameOverDiv = document.getElementById('game-over');
        gameOverDiv.style.display = 'block';
        document.getElementById('final-score').innerText = (this.score / 10).toString();
        document.getElementById('final-points').innerText = this.score.toString();
        
        const controlsDiv = document.getElementById('controls');
        if(controlsDiv) controlsDiv.style.display = 'none';

        const nextBtn = document.getElementById('btn-next-level');
        if (this.currentLevel < 11) {
            nextBtn.style.display = 'inline-block';
            nextBtn.onclick = () => {
                gameOverDiv.style.display = 'none';
                if(controlsDiv) controlsDiv.style.display = 'flex';
                this.scene.start('Level', { level: this.currentLevel + 1, score: this.score });
            };
        } else {
            nextBtn.style.display = 'none';
        }
    }
}
