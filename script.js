// ================= OVERLAY =================
const overlay = document.getElementById("overlay");
let started = false;

// ================= AUDIO (SIMPLE & SAFE) =================
const bgm = new Audio("music.mp3");
bgm.loop = true;
bgm.volume = 0.5;
bgm.preload = "auto";

// ================= CANVAS =================
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

let cw, ch;
function resize() {
  cw = canvas.width = window.innerWidth;
  ch = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// ================= STATE =================
let textTriggered = false;
let textProgress = 0;

// ================= START =================
overlay.addEventListener("click", startApp);
overlay.addEventListener("touchstart", startApp, { passive: true });

function startApp() {
  if (started) return;
  started = true;
  overlay.style.display = "none";

  // PHÁT NHẠC NGAY TRONG CLICK
  bgm.play().catch(err => {
    console.log("Audio error:", err);
  });

  // hiện chữ
  textTriggered = true;

  // pháo hoa mở màn
  for (let i = 0; i < 6; i++) {
    fireworks.push(
      new Firework(
        cw / 2 + (Math.random() - 0.5) * 260,
        ch * 0.28
      )
    );
  }

  requestAnimationFrame(animate);
}

// ================= UTILS =================
function mapRange(a, b, c, d, v) {
  return c + (d - c) * ((v - a) / (b - a));
}

// ================= TREE =================
const particles = [];
const COUNT = 1200;

for (let i = 0; i < COUNT; i++) {
  const y = mapRange(0, COUNT, ch * 0.25, ch * 0.9, i);
  const spread = mapRange(0, COUNT, 20, 420, i);

  particles.push({
    x: cw / 2 + (Math.random() - 0.5) * spread,
    y,
    r: Math.random() * 1.4 + 0.6,
    offset: Math.random() * Math.PI * 2,
    color: `hsl(${Math.random() * 360},80%,70%)`,
    blink: Math.random() * Math.PI * 2
  });
}

// ================= SNOW =================
const snow = Array.from({ length: 200 }, () => ({
  x: Math.random() * cw,
  y: Math.random() * ch,
  r: Math.random() * 2 + 1,
  s: Math.random() * 1 + 0.5
}));

// ================= STAR =================
function drawStar(x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(0, r);
    ctx.rotate(Math.PI / 5);
    ctx.lineTo(0, -r);
    ctx.rotate(-Math.PI * 3 / 5);
  }
  ctx.fillStyle = "gold";
  ctx.fill();
  ctx.restore();
}

// ================= FIREWORKS =================
const fireworks = [];
const sparks = [];

class Firework {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.life = 35;
  }
  update() {
    this.life--;
    if (this.life === 0) explode(this.x, this.y);
  }
}

class Spark {
  constructor(x, y) {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * 3 + 2;
    this.x = x;
    this.y = y;
    this.vx = Math.cos(a) * s;
    this.vy = Math.sin(a) * s;
    this.life = 80;
    this.color = `hsl(${Math.random() * 360},100%,70%)`;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.03;
    this.life--;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, 2, 2);
  }
}

function explode(x, y) {
  for (let i = 0; i < 120; i++) {
    sparks.push(new Spark(x, y));
  }
}

// ================= TEXT =================
function drawText(alpha, scale) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cw / 2, ch * 0.33);
  ctx.scale(scale, scale);
  ctx.fillStyle = "white";
  ctx.font = "64px 'Great Vibes', cursive";
  ctx.textAlign = "center";
  ctx.fillText("Merry Christmas", 0, 0);
  ctx.restore();
}

// ================= ANIMATE =================
let t = 0;

function animate() {
  ctx.clearRect(0, 0, cw, ch);

  // SNOW
  snow.forEach(s => {
    s.y += s.s;
    if (s.y > ch) {
      s.y = 0;
      s.x = Math.random() * cw;
    }
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // TREE
  particles.forEach(p => {
    const sway = Math.sin(t + p.offset) * 6;
    ctx.fillStyle =
      Math.sin(t * 2 + p.blink) > 0.6 ? p.color : "white";
    ctx.beginPath();
    ctx.arc(p.x + sway, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // STAR
  drawStar(cw / 2, ch * 0.2, 14);

  // FIREWORKS
  fireworks.forEach((f, i) => {
    f.update();
    if (f.life <= 0) fireworks.splice(i, 1);
  });

  sparks.forEach((s, i) => {
    s.update();
    s.draw();
    if (s.life <= 0) sparks.splice(i, 1);
  });

  // TEXT
  if (textTriggered) {
    textProgress = Math.min(textProgress + 0.02, 1);
    const ease = 1 - Math.pow(1 - textProgress, 3);
    drawText(ease, 0.9 + 0.1 * ease);
  }

  t += 0.01;
  requestAnimationFrame(animate);
}