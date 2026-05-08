const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* =========================
   SETTINGS
========================= */

const FOV = 600;
const SPEED = 5;
const STAR_COUNT = 200;

const SIGNAL_SPEED = 12;
const SIGNAL_LIFETIME = 90;

/* =========================
   MOUSE STATE
========================= */

const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

/* =========================
   STARS
========================= */

const stars = [];

class Star {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = (Math.random() - 0.5) * 1000;
        this.y = (Math.random() - 0.5) * 1000;
        this.z = Math.random() * 3000 + 1;

        this.px = 0;
        this.py = 0;
    }

    update() {

        this.z -= SPEED;

        if (this.z <= 1) {
            this.reset();
            this.z = 3000;
        }

        const scale = FOV / this.z;

        this.px = this.x * scale + canvas.width / 2;
        this.py = this.y * scale + canvas.height / 2;
    }

    draw() {

        const size = Math.max(0, 2 * (1 - this.z / 3000));

        ctx.beginPath();
        ctx.arc(this.px, this.py, size, 0, Math.PI * 2);

        ctx.fillStyle = "rgba(0,255,200,0.8)";
        ctx.fill();
    }
}

for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Star());
}

/* =========================
   SIGNAL SYSTEM
========================= */

const signals = [];

window.addEventListener("click", () => {

    signals.push({
        x: mouse.x,
        y: mouse.y,
        radius: 10,
        life: SIGNAL_LIFETIME
    });
});

/* =========================
   AUTO SIGNAL SYSTEM (NEW)
========================= */

let autoTimer = 0;

function spawnAutoSignal() {

    const centerBias = 0.6;

    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;

    signals.push({
        x: x * (1 - centerBias) + mouse.x * centerBias,
        y: y * (1 - centerBias) + mouse.y * centerBias,
        radius: 10,
        life: SIGNAL_LIFETIME
    });
}

function updateAutoSignals() {

    autoTimer++;

    if (autoTimer > 160 + Math.random() * 120) {
        spawnAutoSignal();
        autoTimer = 0;
    }
}

/* =========================
   SIGNAL UPDATE
========================= */

function updateSignals() {

    for (let s of signals) {
        s.radius += SIGNAL_SPEED;
        s.life -= 1;
    }

    for (let i = signals.length - 1; i >= 0; i--) {
        if (signals[i].life <= 0) {
            signals.splice(i, 1);
        }
    }
}

/* =========================
   WAVE CONNECTION SYSTEM
========================= */

function connect() {

    const thickness = 40;

    for (let s of signals) {

        for (let i = 0; i < stars.length; i++) {

            const a = stars[i];

            const dx = a.px - s.x;
            const dy = a.py - s.y;

            const dist = Math.sqrt(dx * dx + dy * dy);

            const inWave = Math.abs(dist - s.radius) < thickness;

            if (!inWave) continue;

            let connections = 0;

            for (let j = 0; j < stars.length; j++) {

                if (i === j) continue;

                const b = stars[j];

                const dx2 = a.px - b.px;
                const dy2 = a.py - b.py;

                const dist2 = dx2 * dx2 + dy2 * dy2;

                if (dist2 < 4000) {

                    const alpha = 1 - dist2 / 4000;

                    ctx.beginPath();
                    ctx.moveTo(a.px, a.py);
                    ctx.lineTo(b.px, b.py);

                    ctx.strokeStyle = `rgba(0,255,200,${alpha * 0.4})`;
                    ctx.lineWidth = 1;

                    ctx.stroke();

                    connections++;

                    if (connections > 2) break;
                }
            }
        }
    }
}

/* =========================
   LOOP
========================= */

function animate() {

    ctx.fillStyle = "rgba(5,7,13,0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let star of stars) {
        star.update();
        star.draw();
    }

    updateAutoSignals();
    updateSignals();
    connect();

    requestAnimationFrame(animate);
}

animate();

/* =========================
   RESIZE
========================= */

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});