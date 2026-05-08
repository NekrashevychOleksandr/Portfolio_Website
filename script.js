const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* =========================
   SETTINGS
========================= */

const baseSpeed = 5;
let SPEED = baseSpeed;

let SIGNAL_SPEED = 12;
const SIGNAL_LIFETIME = 90;

const STAR_COUNT = 200;

/* =========================
   STATE
========================= */

let state = 0;
let t = 0;

/* =========================
   ELEMENTS
========================= */

const intro = document.getElementById("center");
const portfolio = document.getElementById("portfolio");

/* =========================
   INPUT
========================= */

window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

document.getElementById("enter").addEventListener("click", () => {
    if (state === 0) state = 1;
});

/* =========================
   MOUSE
========================= */

const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

/* =========================
   STATE UPDATE
========================= */

function updateState() {

    t += 0.01;

    /* INTRO EXIT */
    if (state === 1) {

        const p = Math.min(t / 0.4, 1);

        const drift = p * 500;
        const curve = Math.sin(p * Math.PI) * 120;

        intro.style.transform =
            `translateX(${-drift - curve}px) scale(${1 + p * 0.15})`;

        intro.style.opacity = String(1 - p * 1.5);

        SPEED = baseSpeed;

        if (p >= 1) {
            state = 2;
            t = 0;

            /* ✅ FIX: REMOVE INTRO FROM INTERACTION FLOW */
            intro.style.display = "none";
            intro.style.pointerEvents = "none";
        }
    }

    /* WARP */
    else if (state === 2) {

        const p = Math.min(t / 0.6, 1);

        SPEED = baseSpeed + p * 30;
        SIGNAL_SPEED = 12 + p * 8;

        if (p >= 1) {
            state = 3;
            t = 0;
        }
    }

    /* SETTLE */
    else if (state === 3) {

        const p = Math.min(t / 0.6, 1);

        SPEED = baseSpeed + (1 - p) * 30;
        SIGNAL_SPEED = 12;

        if (p >= 1) {
            state = 4;
            t = 0;
        }
    }

    /* PORTFOLIO */
    else if (state === 4) {

        const p = Math.min(t / 0.5, 1);

        portfolio.style.opacity = String(p);
        portfolio.style.transform =
            `translateX(${(1 - p) * 600}px)`;
    }
}

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

        const scale = 600 / this.z;

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

window.addEventListener("click", (e) => {

    signals.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        life: SIGNAL_LIFETIME
    });
});

let autoTimer = 0;

function updateAutoSignals() {

    autoTimer++;

    if (autoTimer > 160 + Math.random() * 120) {

        signals.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 10,
            life: SIGNAL_LIFETIME
        });

        autoTimer = 0;
    }
}

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
   CONNECTIONS
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

    updateState();

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