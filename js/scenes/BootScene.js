export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load the assets copied previously
        this.load.image('bg', 'assets/bg.png');
        this.load.image('face', 'assets/face.jpg');
        this.load.image('player_sprite', 'assets/player_sprite.png');
        this.load.image('dino', 'assets/dino.png');
        this.load.image('gun', 'assets/gun.png');

        const bgs = [
            'bg_level2_woodland', 'bg_level3_desert', 'bg_level4_arctic', 'bg_level5_toxic',
            'bg_level6_volcanic', 'bg_level7_crystal', 'bg_level8_ruins', 'bg_level9_underwater',
            'bg_level10_space', 'bg_level11_cyber'
        ];
        bgs.forEach(bg => this.load.image(bg, `assets/${bg}.png`));

        const dinos = [
            'dino_trex', 'dino_triceratops', 'dino_stegosaurus',
            'dino_pterodactyl', 'dino_velociraptor', 'dino_rob'
        ];
        
        // --- SPRITE SHEET PREPARATION ---
        // Currently loading these as single static images.
        // When you have sprite sheets ready, replace the `.image()` calls above and below with:
        // this.load.spritesheet('dino_trex', 'assets/dino_trex.png', { frameWidth: 100, frameHeight: 100 });
        
        dinos.forEach(d => this.load.image(d, `assets/${d}.png`));
        
        // Generate an ice ball projectile texture
        let graphics = this.add.graphics();
        // outer glow
        graphics.fillStyle(0x00ffff, 0.5);
        graphics.fillCircle(8, 8, 8);
        // inner core
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(8, 8, 4);
        graphics.generateTexture('bullet', 16, 16);
        graphics.clear();
        
        // Generate particle texture for the trail
        graphics.fillStyle(0xccffff, 0.8);
        graphics.fillCircle(3, 3, 3);
        graphics.generateTexture('ice-particle', 6, 6);
        graphics.destroy();
    }

    create() {
        // Crop the double-stacked background so we only keep the bottom half
        const bgImg = this.textures.get('bg').getSourceImage();
        const halfHeight = bgImg.height / 2;
        let bgCanvas = this.textures.createCanvas('bg_cropped', bgImg.width, halfHeight);
        let ctxBg = bgCanvas.getContext();
        // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        ctxBg.drawImage(bgImg, 0, halfHeight, bgImg.width, halfHeight, 0, 0, bgImg.width, halfHeight);
        bgCanvas.refresh();

        const makeTrans = (key) => {
            const img = this.textures.get(key).getSourceImage();
            let canvas = this.textures.createCanvas(`${key}_trans`, img.width, img.height);
            let ctx = canvas.getContext();
            ctx.drawImage(img, 0, 0);
            let imgData = ctx.getImageData(0, 0, img.width, img.height);
            let data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i] > 230 && data[i+1] > 230 && data[i+2] > 230) {
                    data[i+3] = 0; 
                }
            }
            ctx.putImageData(imgData, 0, 0);
            canvas.refresh();
        };

        makeTrans('player_sprite');
        
        const allDinos = ['dino', 'dino_trex', 'dino_triceratops', 'dino_stegosaurus', 'dino_pterodactyl', 'dino_velociraptor', 'dino_rob'];
        allDinos.forEach(makeTrans);
        
        const bgsToCrop = [
            'bg_level3_desert', 'bg_level4_arctic', 'bg_level5_toxic', 'bg_level6_volcanic', 
            'bg_level7_crystal', 'bg_level8_ruins', 'bg_level9_underwater',
            'bg_level10_space', 'bg_level11_cyber'
        ];
        bgsToCrop.forEach(key => {
            if (this.textures.exists(key)) {
                const bgImg = this.textures.get(key).getSourceImage();
                const halfHeight = bgImg.height / 2;
                let bgCanvas = this.textures.createCanvas(`${key}_cropped`, bgImg.width, halfHeight);
                let ctxBg = bgCanvas.getContext();
                ctxBg.drawImage(bgImg, 0, halfHeight, bgImg.width, halfHeight, 0, 0, bgImg.width, halfHeight);
                bgCanvas.refresh();
            }
        });

        // Setup placeholder animations for currently static assets.
        // When the sprite sheets are loaded above, these animations will automatically
        // start using the frames!
        allDinos.forEach(dinoKey => {
             this.anims.create({
                 key: `${dinoKey}_walk`,
                 frames: this.anims.generateFrameNumbers(`${dinoKey}_trans`) || [{ key: `${dinoKey}_trans` }],
                 frameRate: 8,
                 repeat: -1
             });
        });

        this.anims.create({
             key: 'player_walk',
             frames: this.anims.generateFrameNumbers('player_sprite_trans') || [{ key: 'player_sprite_trans' }],
             frameRate: 10,
             repeat: -1
        });

        this.scene.start('TitleScene');
    }
}
