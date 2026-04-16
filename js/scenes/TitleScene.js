export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        // Ensure HTML UI is hidden during the title screen
        const uiLayer = document.getElementById('ui-layer');
        if (uiLayer) {
            uiLayer.style.display = 'none';
        }

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.image(0, 0, 'bg_cropped').setOrigin(0, 0).setDisplaySize(width, height);

        // Title Text
        this.add.text(width / 2, height * 0.2, 'Beau the Dino Hunter', { 
            fontSize: 'max(4vw, 42px)', 
            fill: '#ffffff', 
            stroke: '#000000', 
            strokeThickness: 8,
            fontFamily: '"Segoe UI", sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Start Button
        const startBtn = this.add.text(width / 2, height * 0.45, 'START GAME', { 
            fontSize: 'max(2.5vw, 24px)', 
            fill: '#00ffff', 
            backgroundColor: 'rgba(0,0,0,0.7)', 
            padding: { left: 30, right: 30, top: 15, bottom: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        startBtn.on('pointerdown', () => {
            this.scene.start('Level', { level: 1, score: 0 });
        });
        
        startBtn.on('pointerover', () => { startBtn.setStyle({ fill: '#ffffff', backgroundColor: 'rgba(0, 255, 255, 0.5)'}); });
        startBtn.on('pointerout', () => { startBtn.setStyle({ fill: '#00ffff', backgroundColor: 'rgba(0, 0, 0, 0.7)'}); });

        // Level Select Header
        this.add.text(width / 2, height * 0.65, 'LEVEL SELECT', { 
            fontSize: 'max(1.8vw, 18px)', 
            fill: '#cccccc',
            fontFamily: '"Segoe UI", sans-serif'
        }).setOrigin(0.5);

        // Level Select Grid (1 to 11)
        const cols = 6;
        const btnSpacingX = Math.min(80, width / cols);
        const btnSpacingY = 80;
        let startX = (width / 2) - ((cols - 1) * btnSpacingX / 2);
        
        for (let i = 1; i <= 11; i++) {
            let row = Math.floor((i - 1) / cols);
            let col = (i - 1) % cols;
            
            // Re-center second row if it's not full
            let tempStartX = startX;
            if (row === 1) {
                let remainingCols = 11 - cols;
                tempStartX = (width / 2) - ((remainingCols - 1) * btnSpacingX / 2);
            }

            let btn = this.add.text(tempStartX + col * btnSpacingX, (height * 0.75) + row * btnSpacingY, i.toString(), { 
                fontSize: '20px', 
                fill: '#ffffff', 
                backgroundColor: 'rgba(0, 0, 0, 0.6)', 
                padding: { left: 20, right: 20, top: 15, bottom: 15 } 
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            btn.on('pointerdown', () => {
                this.scene.start('Level', { level: i, score: 0 });
            });
            
            btn.on('pointerover', () => { btn.setStyle({ backgroundColor: 'rgba(0, 255, 255, 0.6)'}); });
            btn.on('pointerout', () => { btn.setStyle({ backgroundColor: 'rgba(0, 0, 0, 0.6)'}); });
        }
    }
}
