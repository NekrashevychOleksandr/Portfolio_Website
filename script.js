function lockScroll() {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    document.querySelectorAll(".modal-content").forEach(el => {
        el.style.overflow = "auto";
    });
}

function unlockScroll() {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    document.querySelectorAll(".modal-content").forEach(el => {
        el.style.overflow = "";
    });
}

const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* =========================
   ELEMENTS
========================= */

const enterBtn = document.getElementById("enter");
const introScreen = document.getElementById("intro-screen");
const appLayout = document.getElementById("app-layout");

/* NEW PROJECT ELEMENTS */

const projectCards = document.querySelectorAll(".project-card");
const projectModals = document.querySelectorAll(".project-modal");
const closeButtons = document.querySelectorAll(".close-modal");

/* =========================
   SETTINGS
========================= */

const STAR_COUNT = 220;

const baseSpeed = 4;
let SPEED = baseSpeed;

let SIGNAL_SPEED = 12;
const SIGNAL_LIFETIME = 90;

/* =========================
   STATE
========================= */

let entered = false;
let transitionT = 0;
let transitionPhase = 0; // 0 idle, 1 entering, 2 settled

/* =========================
   ENTER HANDLER
========================= */

enterBtn.addEventListener("click", () => {

    if (entered) return;

    entered = true;
    transitionPhase = 1;
    transitionT = 0;


    introScreen.classList.add("hidden");

    setTimeout(() => {
        appLayout.classList.add("active");
        transitionPhase = 2;
    }, 200);
});

/* =========================
   PROJECT CARDS
========================= */

projectCards.forEach(card => {

    const hoverVideo = card.querySelector(".project-video");


    card.addEventListener("mouseenter", () => {

        if (!hoverVideo) return;

        hoverVideo.currentTime = 0;

        hoverVideo.play().catch(() => {});
    });

    /* stop video when leaving */
    card.addEventListener("mouseleave", () => {

        if (!hoverVideo) return;

        hoverVideo.pause();

        hoverVideo.currentTime = 0;
    });

    /* open modal */
    card.addEventListener("click", () => {

        const modalId = card.dataset.modal;

        const modal = document.getElementById(modalId);

        if (!modal) return;

        modal.classList.add("active");

        lockScroll();

        const modalVideo = modal.querySelector("video");

        if (modalVideo) {
            modalVideo.play().catch(() => {});
        }
    });
});

/* =========================
   CLOSE MODALS
========================= */

function closeModal(modal) {

    modal.classList.remove("active");

    unlockScroll();

    const modalVideo = modal.querySelector("video");

    if (modalVideo) {

        modalVideo.pause();

        modalVideo.currentTime = 0;
    }
}

closeButtons.forEach(button => {

    button.addEventListener("click", () => {

        const modal = button.closest(".project-modal");

        closeModal(modal);
    });
});

/* click outside modal */

projectModals.forEach(modal => {

    modal.addEventListener("click", (e) => {

        if (e.target === modal) {
            closeModal(modal);
        }
    });
});

/* escape key */

window.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        projectModals.forEach(modal => {

            if (modal.classList.contains("active")) {
                closeModal(modal);
            }
        });
    }
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
        this.x = (Math.random() - 0.5) * 1400;
        this.y = (Math.random() - 0.5) * 1400;
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

        const scale = 700 / this.z;

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
   SIGNALS
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

    if (autoTimer > 140 + Math.random() * 100) {

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

            if (Math.abs(dist - s.radius) >= thickness) continue;

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

                    if (++connections > 2) break;
                }
            }
        }
    }
}

/* =========================
   TRANSITION LOGIC
========================= */

function updateTransition() {

    // idle state
    if (!entered) {
        SPEED += (baseSpeed - SPEED) * 0.05;
        SIGNAL_SPEED += (12 - SIGNAL_SPEED) * 0.05;
        return;
    }

    // entering burst
    if (transitionPhase === 1) {

        transitionT += 0.03;

        const burst = Math.sin(transitionT * 4);

        SPEED += ((baseSpeed + 30 + burst * 5) - SPEED) * 0.06;
        SIGNAL_SPEED += (22 - SIGNAL_SPEED) * 0.06;

        return;
    }


    if (transitionPhase === 2) {

        SPEED += (baseSpeed - SPEED) * 0.04;
        SIGNAL_SPEED += (12 - SIGNAL_SPEED) * 0.04;
    }
}

/* =========================
   LOOP
========================= */

function animate() {

    ctx.fillStyle = "rgba(5,7,13,0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateTransition();

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

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", resizeCanvas);
resizeCanvas();
