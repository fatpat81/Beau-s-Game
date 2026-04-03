import BootScene from './scenes/BootScene.js';
import Level1 from './scenes/Level1.js';

// Global input state bridged from DOM layer
window.gameInput = {
    up: false,
    down: false,
    left: false,
    right: false,
    fire: false
};

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1500 }, // Ensure character returns to ground smoothly
            debug: false
        }
    },
    scene: [BootScene, Level1]
};

const game = new Phaser.Game(config);

// Bind HTML Controls
function bindBtn(id, key) {
    const btn = document.getElementById(id);
    if (!btn) return;

    const press = (e) => {
        e.preventDefault();
        window.gameInput[key] = true;
        btn.classList.add('active');
    };
    const release = (e) => {
        e.preventDefault();
        window.gameInput[key] = false;
        btn.classList.remove('active');
    };

    btn.addEventListener('touchstart', press);
    btn.addEventListener('touchend', release);
    btn.addEventListener('mousedown', press);
    btn.addEventListener('mouseup', release);
    btn.addEventListener('mouseleave', release);
}

document.addEventListener("DOMContentLoaded", () => {
    bindBtn('btn-up', 'up');
    bindBtn('btn-down', 'down');
    bindBtn('btn-left', 'left');
    bindBtn('btn-right', 'right');
    bindBtn('btn-action', 'fire');
    
    // Add WASD/Arrow key support for testing on Desktop
    window.addEventListener('keydown', (e) => {
        if(e.code === 'KeyW' || e.code === 'ArrowUp') window.gameInput.up = true;
        if(e.code === 'KeyS' || e.code === 'ArrowDown') window.gameInput.down = true;
        if(e.code === 'KeyA' || e.code === 'ArrowLeft') window.gameInput.left = true;
        if(e.code === 'KeyD' || e.code === 'ArrowRight') window.gameInput.right = true;
        if(e.code === 'Space') window.gameInput.fire = true;
    });

    window.addEventListener('keyup', (e) => {
        if(e.code === 'KeyW' || e.code === 'ArrowUp') window.gameInput.up = false;
        if(e.code === 'KeyS' || e.code === 'ArrowDown') window.gameInput.down = false;
        if(e.code === 'KeyA' || e.code === 'ArrowLeft') window.gameInput.left = false;
        if(e.code === 'KeyD' || e.code === 'ArrowRight') window.gameInput.right = false;
        if(e.code === 'Space') window.gameInput.fire = false;
    });
});
