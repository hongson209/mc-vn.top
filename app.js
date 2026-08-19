const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* Cursor */
const dot = $("#cursorDot");
const ring = $("#cursorRing");
const glow = $("#mouseGlow");

let mx = innerWidth / 2;
let my = innerHeight / 2;
let rx = mx;
let ry = my;
let lastParticle = 0;

if (matchMedia("(pointer:fine)").matches) {
  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (dot) {
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
      glow.style.left = `${mx}px`;
      glow.style.top = `${my}px`;
    }

    const now = performance.now();
    if (now - lastParticle > 45) {
      lastParticle = now;
      const p = document.createElement("span");
      p.className = "cursor-particle";
      p.style.left = `${mx}px`;
      p.style.top = `${my}px`;
      p.style.setProperty("--dx", `${(Math.random() - .5) * 24}px`);
      p.style.setProperty("--dy", `${8 + Math.random() * 18}px`);
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 700);
    }
  });

  const animateRing = () => {
    rx += (mx - rx) * .17;
    ry += (my - ry) * .17;
    ring.style.left = `${rx}px`;
    ring.style.top = `${ry}px`;
    requestAnimationFrame(animateRing);
  };
  animateRing();

  $$("a,button,.tilt-card").forEach(el => {
    el.addEventListener("mouseenter", () => ring.classList.add("hover"));
    el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
  });
}

/* Magnetic */
if (matchMedia("(pointer:fine)").matches) {
  $$(".magnetic").forEach(el => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * .09}px,${y * .11}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
}

/* Tilt cards */
if (matchMedia("(pointer:fine)").matches && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
  $$(".tilt-card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateX(${py * -4}deg) rotateY(${px * 5}deg) translateY(-2px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

/* CTA toast */
function attachCtaToast(el) {
  if (!el) return;
  el.addEventListener("click", () => {
    const toast = $("#toast");
    $("#toastTitle").textContent = "Tạo tên miền ngay";
    $("#toastText").textContent = "Đang mở Kotoba Studio...";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1600);
  });
}
attachCtaToast($("#ctaMain"));
$$('.primary-btn').forEach(attachCtaToast);

/* Credits */
const creditsModal = $("#creditsModal");
function openCredits() {
  creditsModal.classList.add("open");
  creditsModal.setAttribute("aria-hidden", "false");
}
function closeCredits() {
  creditsModal.classList.remove("open");
  creditsModal.setAttribute("aria-hidden", "true");
}
$("#openCredits").addEventListener("click", openCredits);
$$("[data-close-credits]").forEach(el => el.addEventListener("click", closeCredits));

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeCredits();
});

/* Music */
const music = $("#bgMusic");
const musicToggle = $("#musicToggle");
const musicStatus = $("#musicStatus");

const playlist = [
  { title: "Happy Adventure", src: "https://opengameart.org/sites/default/files/happy_adveture.mp3" },
  { title: "8bit Bossa", src: "https://opengameart.org/sites/default/files/8bit%20Bossa.mp3" },
  { title: "The Bard's Tale", src: "https://opengameart.org/sites/default/files/CHIPTUNE_The_Bards_Tale_0.mp3" }
];

let trackIndex = Math.floor(Math.random() * playlist.length);
let userMuted = false;
let audioUnlocked = false;
music.volume = 1.0;

function loadTrack() {
  music.src = playlist[trackIndex].src;
  musicStatus.textContent = "AUTO MUSIC";
}
async function tryAutoplay() {
  if (userMuted) return;
  try {
    await music.play();
    audioUnlocked = true;
    musicToggle.classList.remove("paused");
    musicStatus.textContent = "100% • " + playlist[trackIndex].title.toUpperCase();
  } catch (err) {
    musicToggle.classList.add("paused");
    musicStatus.textContent = "AUTO READY";
  }
}
function unlockAudio() {
  if (userMuted || audioUnlocked) return;
  tryAutoplay();
}
music.addEventListener("ended", () => {
  trackIndex = (trackIndex + 1) % playlist.length;
  loadTrack();
  tryAutoplay();
});
music.addEventListener("error", () => {
  trackIndex = (trackIndex + 1) % playlist.length;
  loadTrack();
});
musicToggle.addEventListener("click", async () => {
  if (!music.paused && !userMuted) {
    userMuted = true;
    music.pause();
    musicToggle.classList.add("paused");
    musicStatus.textContent = "MUTED";
  } else {
    userMuted = false;
    await tryAutoplay();
  }
});
loadTrack();
window.addEventListener("load", tryAutoplay, { once: true });
["pointerdown", "touchstart", "keydown"].forEach(evt => {
  window.addEventListener(evt, unlockAudio, { once: true, passive: true });
});
