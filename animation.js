const canvas = document.getElementById('logo-canvas');
const ctx = canvas.getContext('2d');
const staticLogo = document.getElementById('static-logo');
const logoWrap = document.getElementById('logo-wrap');

let canvasWidth, canvasHeight;

function resizeCanvas() {
    const rect = staticLogo.getBoundingClientRect();
    // We want the canvas to be wide enough for the text "AARUSH SPARSH"
    // The logo image is relatively square-ish or wide.
    // Let's give it extra width for the typing part.
    canvasWidth = 400;
    canvasHeight = 150;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
}

class Particle {
    constructor(effect) {
        this.effect = effect;
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.originX = Math.floor(this.x);
        this.originY = Math.floor(this.y);
        this.color = '#fff';
        this.size = 1.2;
        this.vx = 0;
        this.vy = 0;
        this.ease = 0.08;
        this.friction = 0.9;
        this.r = 255;
        this.g = 255;
        this.b = 255;
    }

    draw(context) {
        context.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`;
        context.fillRect(this.x, this.y, this.size, this.size);
    }

    update() {
        this.vx += (this.originX - this.x) * this.ease;
        this.vy += (this.originY - this.y) * this.ease;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.x += this.vx;
        this.y += this.vy;
    }

    setTarget(x, y, r = 255, g = 255, b = 255) {
        this.originX = x;
        this.originY = y;
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

class Effect {
    constructor() {
        this.particles = [];
        this.gap = 2;
        this.logoParticles = [];
        this.textParticles = [];
        this.currentState = 'WAITING'; // WAITING, LOGO_SAMPLING, ANIMATING, DONE
        this.stateStartTime = 0;
        this.text = "AARUSH SPARSH";
        this.fontSize = 40;
        this.typedIndex = 0;
        this.lastTypeTime = 0;
        this.typeSpeed = 100;
        this.image = new Image();
        this.image.src = staticLogo.src;

        this.image.onload = () => {
            setTimeout(() => this.start(), 1000); // Start after 1s
        };
    }

    start() {
        resizeCanvas();
        this.sampleLogo();
        this.initParticles();
        this.currentState = 'TYPING';
        this.stateStartTime = Date.now();
        staticLogo.classList.add('hidden');
        canvas.classList.add('active');
        animate();
    }

    sampleLogo() {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvasWidth;
        tempCanvas.height = canvasHeight;

        const imgHeight = 80;
        const imgWidth = (this.image.width / this.image.height) * imgHeight;
        const imgX = 0; // Left aligned
        const imgY = (canvasHeight - imgHeight) / 2;

        tempCtx.drawImage(this.image, imgX, imgY, imgWidth, imgHeight);
        const pixels = tempCtx.getImageData(0, 0, canvasWidth, canvasHeight).data;

        for (let y = 0; y < canvasHeight; y += this.gap) {
            for (let x = 0; x < canvasWidth; x += this.gap) {
                const index = (y * canvasWidth + x) * 4;
                const alpha = pixels[index + 3];
                if (alpha > 50) {
                    this.logoParticles.push({ x, y, r: pixels[index], g: pixels[index + 1], b: pixels[index + 2] });
                }
            }
        }
    }

    initParticles() {
        const count = 1500; // Fixed count for smoothness
        for (let i = 0; i < count; i++) {
            const p = new Particle(this);
            const target = this.logoParticles[i % this.logoParticles.length];
            p.x = target.x;
            p.y = target.y;
            p.setTarget(target.x, target.y, target.r, target.g, target.b);
            this.particles.push(p);
        }
    }

    updateText(visibleText) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvasWidth;
        tempCanvas.height = canvasHeight;
        tempCtx.font = `bold ${this.fontSize}px 'Outfit'`;
        tempCtx.fillStyle = 'white';
        tempCtx.textAlign = 'left';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(visibleText, 20, canvasHeight / 2);

        const pixels = tempCtx.getImageData(0, 0, canvasWidth, canvasHeight).data;
        const targets = [];
        for (let y = 0; y < canvasHeight; y += this.gap) {
            for (let x = 0; x < canvasWidth; x += this.gap) {
                const index = (y * canvasWidth + x) * 4;
                if (pixels[index + 3] > 50) {
                    targets.push({ x, y });
                }
            }
        }

        const time = Date.now() * 0.005;
        this.particles.forEach((p, i) => {
            if (targets.length > 0) {
                const target = targets[i % targets.length];
                // RGB flow
                const r = Math.sin(time + i * 0.01) * 127 + 128;
                const g = Math.sin(time + i * 0.01 + 2) * 127 + 128;
                const b = Math.sin(time + i * 0.01 + 4) * 127 + 128;
                p.setTarget(target.x, target.y, r, g, b);
            }
        });
    }

    update() {
        const now = Date.now();
        const elapsed = now - this.stateStartTime;

        if (this.currentState === 'TYPING') {
            if (now - this.lastTypeTime > this.typeSpeed && this.typedIndex <= this.text.length) {
                this.typedIndex++;
                this.lastTypeTime = now;
                this.updateText(this.text.substring(0, this.typedIndex));
            }
            if (this.typedIndex > this.text.length && elapsed > 4000) {
                this.currentState = 'REVERSE';
                this.stateStartTime = now;
            }
        } else if (this.currentState === 'REVERSE') {
            this.particles.forEach((p, i) => {
                const target = this.logoParticles[i % this.logoParticles.length];
                p.setTarget(target.x, target.y, target.r, target.g, target.b);
            });
            if (elapsed > 2000) {
                this.currentState = 'DONE';
                staticLogo.classList.remove('hidden');
                canvas.classList.remove('active');
            }
        }

        this.particles.forEach(p => p.update());
    }

    draw(context) {
        this.particles.forEach(p => p.draw(context));
    }
}

const effect = new Effect();

function animate() {
    if (effect.currentState === 'DONE') return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.update();
    effect.draw(ctx);
    requestAnimationFrame(animate);
}
