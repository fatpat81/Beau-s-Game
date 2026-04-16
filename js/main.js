import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import Level from './scenes/Level.js';

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
            gravity: { y: 0 }, 
            debug: false
        }
    },
    scene: [BootScene, TitleScene, Level]
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

// Joystick Logic
function bindJoystick() {
    const zone = document.getElementById('joystick-zone');
    const knob = document.getElementById('joystick-knob');
    if (!zone || !knob) return;

    let active = false;
    let originX, originY;
    const maxRadius = 35;

    const start = (e) => {
        active = true;
        const rect = zone.getBoundingClientRect();
        originX = rect.left + rect.width / 2;
        originY = rect.top + rect.height / 2;
        move(e);
    };

    const move = (e) => {
        if (!active) return;
        e.preventDefault();
        
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        let deltaX = clientX - originX;
        let deltaY = clientY - originY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > maxRadius) {
            const ratio = maxRadius / distance;
            deltaX *= ratio;
            deltaY *= ratio;
        }

        knob.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

        const deadzone = 10;
        window.gameInput.left = deltaX < -deadzone;
        window.gameInput.right = deltaX > deadzone;
        window.gameInput.up = deltaY < -deadzone;
        window.gameInput.down = deltaY > deadzone;
    };

    const end = () => {
        active = false;
        knob.style.transform = `translate(-50%, -50%)`;
        window.gameInput.left = false;
        window.gameInput.right = false;
        window.gameInput.up = false;
        window.gameInput.down = false;
    };

    zone.addEventListener('touchstart', start, {passive: false});
    zone.addEventListener('touchmove', move, {passive: false});
    zone.addEventListener('touchend', end);
    zone.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
}

document.addEventListener("DOMContentLoaded", () => {
    bindJoystick();
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
