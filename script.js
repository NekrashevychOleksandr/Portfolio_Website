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

// 0 = intro center
// 1 = moving intro to top-left
// 2 = idle (intro parked top-left)
// 3 = warp transition
// 4 = portfolio open
let state = 0;
let t = 0;

/* =========================
   ELEMENTS
========================= */

const intro = document.getElementById("center");
const portfolio = document.getElementById("portfolio");

/* =========================
   MOUSE
========================= */

const mouse = {
    x: 0,
    y: 0
};

window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

/* =========================
   INPUT
========================= */

document.getElementById("enter").addEventListener("click", () => {

    // first click: move intro to corner
    if (state === 0) {
        state = 1;
        t = 0;
        return;
    }

    // second click: open portfolio
    if (state === 2) {
        state = 3;
        t = 0;
    }
});

/* =========================
   STATE UPDATE
========================= */

function updateState() {

    t += 0.01;

    /* =========================
       INTRO → TOP LEFT TRANSITION
    ========================= */
    if (state === 1) {

        const p = Math.min(t / 1.0, 1); // slower + smoother transition

        // smoother easing (important fix)
        const ease = p * p * (3 - 2 * p);

        const scale = 1 - ease * 0.65;

        const x = ease * (-window.innerWidth / 2 + 40);
        const y = ease * (-window.innerHeight / 2 + 40);

        intro.style.transform =
            `translate(${x}px, ${y}px) scale(${scale})`;

        intro.style.opacity = String(1);

        SPEED = baseSpeed + ease * 20;
        SIGNAL_SPEED = 12 + ease * 8;

        if (p >= 1) {
            state = 2;
            t = 0;

            intro.style.position = "fixed";
            intro.style.top = "20px";
            intro.style.left = "20px";
            intro.style.transformOrigin = "top left";
        }
    }

    /* =========================
       IDLE STATE (intro parked top-left)
    ========================= */
    else if (state === 2) {

        SPEED = baseSpeed;
        SIGNAL_SPEED = 12;

        intro.style.transform = "scale(0.35)";
    }

    /* =========================
       WARP INTO PORTFOLIO
    ========================= */
    else if (state === 3) {

        const p = Math.min(t / 1.6, 1); // longer warp (fix)

        const ease = p * p * (3 - 2 * p);

        SPEED = baseSpeed + ease * 45;
        SIGNAL_SPEED = 12 + ease * 10;

        portfolio.style.opacity = String(ease);
        portfolio.style.transform = `translateX(${(1 - ease) * 500}px)`;

        if (p >= 1) {
            state = 4;
            t = 0;
        }
    }

    /* =========================
       PORTFOLIO OPEN
    ========================= */
    else if (state === 4) {

        SPEED = baseSpeed;
        SIGNAL_SPEED = 12;

        portfolio.style.opacity = "1";
        portfolio.style.transform = "translateX(0px)";
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