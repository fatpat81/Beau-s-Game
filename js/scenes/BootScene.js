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

        // Remove white background from player sprite
        const srcImage = this.textures.get('player_sprite').getSourceImage();
        let canvasTexture = this.textures.createCanvas('player_sprite_trans', srcImage.width, srcImage.height);
        let ctx = canvasTexture.getContext();
        ctx.drawImage(srcImage, 0, 0);
        let imgData = ctx.getImageData(0, 0, srcImage.width, srcImage.height);
        let data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            // Check for white or near-white
            if (data[i] > 230 && data[i+1] > 230 && data[i+2] > 230) {
                data[i+3] = 0; // Set alpha to 0 for transparency
            }
        }
        ctx.putImageData(imgData, 0, 0);
        canvasTexture.refresh();

        // Remove white background from dino sprite
        const dinoImg = this.textures.get('dino').getSourceImage();
        let dinoCanvas = this.textures.createCanvas('dino_trans', dinoImg.width, dinoImg.height);
        let ctxDino = dinoCanvas.getContext();
        ctxDino.drawImage(dinoImg, 0, 0);
        let dinoImgData = ctxDino.getImageData(0, 0, dinoImg.width, dinoImg.height);
        let dinoData = dinoImgData.data;
        for (let i = 0; i < dinoData.length; i += 4) {
            // Check for white or near-white
            if (dinoData[i] > 230 && dinoData[i+1] > 230 && dinoData[i+2] > 230) {
                dinoData[i+3] = 0; // Set alpha to 0 for transparency
            }
        }
        ctxDino.putImageData(dinoImgData, 0, 0);
        dinoCanvas.refresh();
        
        this.scene.start('Level1');
    }
}
