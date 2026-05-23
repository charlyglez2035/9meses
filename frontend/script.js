// ====== FLOATING HEARTS ======
const heartsContainer = document.getElementById('hearts');
const heartEmojis = ['💛','💙','💜','🌟','✨'];
for (let i = 0; i < 12; i++) {
  const h = document.createElement('div');
  h.className = 'heart-float';
  h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
  h.style.left = Math.random() * 100 + '%';
  h.style.animationDuration = (8 + Math.random() * 12) + 's';
  h.style.animationDelay = (Math.random() * 15) + 's';
  h.style.fontSize = (14 + Math.random() * 16) + 'px';
  heartsContainer.appendChild(h);
}

// ====== NAVIGATION ======
function showSection(id) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('nav button').forEach((b, i) => {
    b.classList.toggle('active', ['photos','letters','game-section'][i] === id);
  });
}

// ====== CLOUDINARY PHOTOS ======

async function uploadPhotos(files) {

    for (const file of files) {

        const reader = new FileReader();

        reader.onload = async function(e) {

            try {

                await fetch('/api/photos', {

                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        image: e.target.result
                    })

                });

                loadPhotos();

            } catch (error) {

                console.error(error);

                alert('Error subiendo foto 😭');
            }

        };

        reader.readAsDataURL(file);
    }
}


async function loadPhotos() {

    try {

        const response = await fetch('/api/photos');

        const photos = await response.json();

        const gallery = document.getElementById('galleryGrid');

        gallery.innerHTML = '';

        if (photos.length === 0) {

            gallery.innerHTML = `
                <div class="empty-state" id="emptyGallery" style="grid-column:1/-1">
                    <div class="icon">🌸</div>
                    <p>Aquí aparecerán sus recuerdos</p>
                </div>
            `;

            return;
        }

        photos.forEach(photo => {

            const card = document.createElement('div');

            card.className = 'gallery-item';

            card.innerHTML = `
                <img src="${photo.secure_url}" alt="Recuerdo">
            `;

            gallery.appendChild(card);

        });

    } catch (error) {

        console.error(error);
    }
}


document.getElementById('fileInput')
.addEventListener('change', (e) => {

    uploadPhotos(e.target.files);

});


const dz = document.getElementById('dropZone');

dz.addEventListener('dragover', e => {

    e.preventDefault();

    dz.style.borderColor = '#FFD700';

});

dz.addEventListener('dragleave', () => {

    dz.style.borderColor = 'rgba(255,215,0,0.4)';

});

dz.addEventListener('drop', e => {

    e.preventDefault();

    dz.style.borderColor = 'rgba(255,215,0,0.4)';

    const files = Array.from(e.dataTransfer.files)
    .filter(f => f.type.startsWith('image/'));

    uploadPhotos(files);

});


loadPhotos();

```javascript
// ====== LETTERS ======

let lettersData = [];

async function loadLetters() {

  try {

    const res = await fetch('/api/letters');

    lettersData = await res.json();

    console.log('Cartas cargadas:', lettersData);

    renderLetters();

  } catch (err) {

    console.error('Error cargando cartas:', err);

  }
}

async function saveLetter() {

  const title = document.getElementById('letterTitle').value.trim();

  const body = document.getElementById('letterBody').value.trim();

  if (!title || !body) {

    alert('¡Escribe un título y el contenido de la carta! 💛');

    return;
  }

  try {

    const res = await fetch('/api/letters', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        title: title,
        content: body
      })

    });

    const data = await res.json();

    console.log('Carta guardada:', data);

    document.getElementById('letterTitle').value = '';

    document.getElementById('letterBody').value = '';

    await loadLetters();

  } catch (err) {

    console.error('Error guardando carta:', err);

  }
}

function renderLetters() {

  const list = document.getElementById('lettersList');

  if (!list) {

    console.log('NO EXISTE lettersList');

    return;
  }

  list.innerHTML = '';

  if (!Array.isArray(lettersData) || lettersData.length === 0) {

    list.innerHTML = `
      <div class="empty-state">
        <div class="icon">✉️</div>
        <p>Aún no hay cartas. ¡Escribe la primera!</p>
      </div>
    `;

    return;
  }

  lettersData.forEach((letter) => {

    const div = document.createElement('div');

    div.className = 'letter-card';

    div.innerHTML = `
      <div class="letter-card-header">

        <div>
          <h3>${letter.title}</h3>

          <div class="date">
            ${new Date(letter.created_at).toLocaleDateString('es-MX')}
          </div>
        </div>

      </div>

      <p>${letter.content.replace(/(?:\r\n|\r|\n)/g, '<br>')}</p>
    `;

    list.appendChild(div);

  });
}

window.addEventListener('DOMContentLoaded', () => {

  loadLetters();

});
```


// ====== GRU vs MINIONS GAME ======
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'idle'; // idle, playing, paused, gameover, win
let score = 0, lives = 3, level = 1;
let gameLoop;
let keys = {};
let bullets = [];
let enemyBullets = [];
let enemies = [];
let player;
let particles = [];
let frameCount = 0;
let mobileLeft = false, mobileRight = false, mobileShoot = false;
let shootCooldown = 0;

// Draw Gru (player)
function drawGru(x, y, w, h) {
  const cx = x + w / 2;
  // Body (dark coat)
  ctx.fillStyle = '#3a3a5c';
  ctx.beginPath();
  ctx.roundRect(x + 4, y + 18, w - 8, h - 18, 4);
  ctx.fill();
  // Head (big oval)
  ctx.fillStyle = '#c8a882';
  ctx.beginPath();
  ctx.ellipse(cx, y + 12, w/2 - 2, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Big nose
  ctx.fillStyle = '#b8987a';
  ctx.beginPath();
  ctx.ellipse(cx, y + 16, 5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(cx - 7, y + 10, 4, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 7, y + 10, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.ellipse(cx - 6, y + 10, 2.5, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + 8, y + 10, 2.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Scarf (red)
  ctx.fillStyle = '#cc3333';
  ctx.fillRect(x + 5, y + 24, w - 10, 5);
  // Arms
  ctx.fillStyle = '#3a3a5c';
  ctx.fillRect(x, y + 22, 5, 15);
  ctx.fillRect(x + w - 5, y + 22, 5, 15);
  // Ray gun (right)
  ctx.fillStyle = '#888';
  ctx.fillRect(x + w - 4, y + 26, 10, 5);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(x + w + 4, y + 27, 4, 3);
}

// Draw Minion (enemy)
function drawMinion(x, y, w, h, type) {
  const cx = x + w / 2;
  const colors = ['#FFD700','#F5A623','#FFD700','#e8c500'];
  const bodyColor = colors[type % 4];
  // Body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(x + 2, y + h*0.3, w - 4, h * 0.7, [4, 4, 8, 8]);
  ctx.fill();
  // Head
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.35, w/2 - 2, h * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  // Overall straps
  ctx.fillStyle = '#5b7bd5';
  ctx.fillRect(x + 2, y + h*0.3, w - 4, h * 0.7);
  // Overall pocket
  ctx.fillStyle = '#4a6ac4';
  ctx.beginPath();
  ctx.roundRect(cx - 6, y + h * 0.55, 12, 10, 2);
  ctx.fill();
  // Head skin over overall
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.3, w/2 - 2, h * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  // Goggle frame (metallic)
  ctx.fillStyle = '#888';
  const eyeY = y + h * 0.25;
  if (type % 2 === 0) {
    // One eye
    ctx.beginPath();
    ctx.ellipse(cx, eyeY, 9, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(cx, eyeY, 7, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a4aee';
    ctx.beginPath();
    ctx.ellipse(cx, eyeY, 4, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(cx + 1, eyeY - 1, 2, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Two eyes
    ctx.beginPath();
    ctx.ellipse(cx - 7, eyeY, 7, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 7, eyeY, 7, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(cx - 7, eyeY, 5, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 7, eyeY, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a4aee';
    ctx.beginPath();
    ctx.ellipse(cx - 7, eyeY, 3, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 7, eyeY, 3, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(cx - 6, eyeY - 1, 1.5, 1.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 8, eyeY - 1, 1.5, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Mouth / smile
  ctx.strokeStyle = '#a07000';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, y + h * 0.45, 5, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
  // Arms
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x - 1, y + h * 0.45, 5, 8);
  ctx.fillRect(x + w - 4, y + h * 0.45, 5, 8);
}

function drawBullet(b) {
  if (b.isEnemy) {
    // Banana bullet
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, 4, 7, b.angle || 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a07000';
    ctx.beginPath();
    ctx.arc(b.x - 1, b.y - 5, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Purple ray
    ctx.fillStyle = '#cc44ff';
    ctx.shadowColor = '#cc44ff';
    ctx.shadowBlur = 8;
    ctx.fillRect(b.x - 2, b.y - 8, 4, 16);
    ctx.shadowBlur = 0;
  }
}

function drawParticle(p) {
  ctx.globalAlpha = p.life;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawBackground() {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  for (let i = 0; i < 60; i++) {
    const sx = (i * 137 + frameCount * 0.2) % canvas.width;
    const sy = (i * 97) % canvas.height;
    ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
  }
  // Banana nebula hint
  ctx.fillStyle = 'rgba(255,215,0,0.04)';
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.7, canvas.height * 0.3, 120, 80, 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function spawnEnemies() {
  enemies = [];
  const rows = Math.min(2 + Math.floor(level / 2), 5);
  const cols = Math.min(4 + Math.floor(level / 2), 9);
  const startX = (canvas.width - cols * 56) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      enemies.push({
        x: startX + c * 56,
        y: 50 + r * 52,
        w: 42, h: 38,
        type: (r + c) % 4,
        alive: true,
        hp: level > 6 ? 2 : 1
      });
    }
  }
}

function initGame() {
  score = 0; lives = 5; level = 1;
  bullets = []; enemyBullets = []; particles = [];
  shootCooldown = 0;
  player = { x: canvas.width / 2 - 24, y: canvas.height - 70, w: 48, h: 54, speed: 5 };
  spawnEnemies();
  updateHUD();
}

function updateHUD() {
  document.getElementById('scoreDisplay').textContent = score;
  document.getElementById('levelDisplay').textContent = level;
  document.getElementById('livesDisplay').textContent = '❤️'.repeat(Math.max(0, lives));
}

let enemyDir = 1, enemySpeed = 0.25, enemyShootTimer = 0;

function updateGame() {
  frameCount++;
  shootCooldown = Math.max(0, shootCooldown - 1);

  // Player movement
  if ((keys['ArrowLeft'] || keys['a'] || mobileLeft) && player.x > 0) player.x -= player.speed;
  if ((keys['ArrowRight'] || keys['d'] || mobileRight) && player.x + player.w < canvas.width) player.x += player.speed;
  if ((keys[' '] || mobileShoot) && shootCooldown === 0) {
    bullets.push({ x: player.x + player.w / 2, y: player.y, vy: -9 });
    shootCooldown = 18;
  }

  // Enemy movement
  const liveEnemies = enemies.filter(e => e.alive);
  if (liveEnemies.length === 0) {
    level++;
    if (level > 10) { gameState = 'win'; return; }
    enemySpeed = Math.min(0.25 + level * 0.12, 1.5);
    spawnEnemies();
    updateHUD();
    return;
  }

  let minX = Math.min(...liveEnemies.map(e => e.x));
  let maxX = Math.max(...liveEnemies.map(e => e.x + e.w));

  if (maxX + enemySpeed * enemyDir > canvas.width || minX + enemySpeed * enemyDir < 0) {
    enemyDir *= -1;
    enemies.forEach(e => { if (e.alive) e.y += 12; });
  }
  enemies.forEach(e => { if (e.alive) e.x += enemySpeed * enemyDir; });

  // Enemy reach bottom
  if (liveEnemies.some(e => e.y + e.h > canvas.height - 70)) {
    lives = 0;
    gameOver();
    return;
  }

  // Enemy shoot
  enemyShootTimer++;
  const shootInterval = Math.max(70 - level * 5, 35);
  if (enemyShootTimer >= shootInterval) {
    enemyShootTimer = 0;
    const shooters = liveEnemies.filter((_, i) => {
      const col = liveEnemies.filter(e2 => Math.abs(e2.x - _.x) < 10);
      return col[col.length - 1] === _;
    });
    if (shooters.length > 0) {
      const s = shooters[Math.floor(Math.random() * shooters.length)];
      enemyBullets.push({ x: s.x + s.w / 2, y: s.y + s.h, vy: 2.5 + level * 0.2, angle: Math.random() * 0.6 });
    }
  }

  // Update player bullets
  bullets = bullets.filter(b => b.y > -20);
  bullets.forEach(b => b.y += b.vy);

  // Bullet vs enemies
  bullets.forEach(b => {
    enemies.forEach(e => {
      if (!e.alive) return;
      if (b.x > e.x && b.x < e.x + e.w && b.y > e.y && b.y < e.y + e.h) {
        e.hp--;
        b.y = -100;
        if (e.hp <= 0) {
          e.alive = false;
          score += 10 * level;
          for (let i = 0; i < 8; i++) {
            particles.push({
              x: e.x + e.w/2, y: e.y + e.h/2,
              vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4,
              r: 3 + Math.random()*4,
              color: ['#FFD700','#FF6B9D','#fff','#80d0ff'][Math.floor(Math.random()*4)],
              life: 1
            });
          }
        }
        updateHUD();
      }
    });
  });

  // Enemy bullets
  enemyBullets = enemyBullets.filter(b => b.y < canvas.height + 20);
  enemyBullets.forEach(b => b.y += b.vy);

  // Enemy bullet vs player
  enemyBullets.forEach(b => {
    if (b.x > player.x && b.x < player.x + player.w && b.y > player.y && b.y < player.y + player.h) {
      b.y = canvas.height + 50;
      lives--;
      updateHUD();
      for (let i = 0; i < 12; i++) {
        particles.push({
          x: player.x + player.w/2, y: player.y + player.h/2,
          vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*5,
          r: 3 + Math.random()*5,
          color: '#ff4444',
          life: 1
        });
      }
      if (lives <= 0) { gameOver(); return; }
    }
  });

  // Particles
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    p.life -= 0.04;
    p.vx *= 0.95; p.vy *= 0.95;
  });
  particles = particles.filter(p => p.life > 0);
}

function render() {
  drawBackground();

  enemies.forEach(e => { if (e.alive) drawMinion(e.x, e.y, e.w, e.h, e.type); });
  bullets.forEach(drawBullet);
  enemyBullets.forEach(b => drawBullet({...b, isEnemy: true}));
  particles.forEach(drawParticle);

  if (gameState === 'playing' || gameState === 'paused') {
    drawGru(player.x, player.y, player.w, player.h);
    // Draw player ship base
    ctx.fillStyle = '#5555aa';
    ctx.beginPath();
    ctx.roundRect(player.x, player.y + player.h - 8, player.w, 8, 4);
    ctx.fill();
  }

  // Overlays
  if (gameState === 'idle') {
    ctx.fillStyle = 'rgba(10,10,26,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Nunito';
    ctx.textAlign = 'center';
    ctx.fillText('¡Gru vs Minions!', canvas.width/2, canvas.height/2 - 40);
    ctx.fillStyle = '#aab0d4';
    ctx.font = '18px Nunito';
    ctx.fillText('Presiona "Iniciar Juego" para comenzar', canvas.width/2, canvas.height/2 + 10);
    ctx.fillText('🍌 ¡Destruye a los Miniones traidores! 🍌', canvas.width/2, canvas.height/2 + 45);
    ctx.textAlign = 'left';
  }

  if (gameState === 'paused') {
    ctx.fillStyle = 'rgba(10,10,26,0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 42px Nunito';
    ctx.textAlign = 'center';
    ctx.fillText('⏸ PAUSA', canvas.width/2, canvas.height/2);
    ctx.textAlign = 'left';
  }

  if (gameState === 'gameover') {
    ctx.fillStyle = 'rgba(10,10,26,0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 48px Nunito';
    ctx.textAlign = 'center';
    ctx.fillText('¡GAME OVER!', canvas.width/2, canvas.height/2 - 30);
    ctx.fillStyle = '#FFD700';
    ctx.font = '24px Nunito';
    ctx.fillText('Puntos: ' + score, canvas.width/2, canvas.height/2 + 20);
    ctx.fillStyle = '#aab0d4';
    ctx.font = '18px Nunito';
    ctx.fillText('¡Los Minions ganaron esta vez! 🍌', canvas.width/2, canvas.height/2 + 55);
    ctx.textAlign = 'left';
  }

  if (gameState === 'win') {
    ctx.fillStyle = 'rgba(10,10,26,0.92)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 44px Nunito';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 ¡GANASTE! 🏆', canvas.width/2, canvas.height/2 - 50);
    ctx.fillStyle = '#FF6B9D';
    ctx.font = '22px Nunito';
    ctx.fillText('¡Gru derrotó a todos los Minions!', canvas.width/2, canvas.height/2);
    ctx.fillStyle = '#FFD700';
    ctx.font = '26px Nunito';
    ctx.fillText('Puntos finales: ' + score, canvas.width/2, canvas.height/2 + 40);
    ctx.fillStyle = '#aab0d4';
    ctx.font = '17px Nunito';
    ctx.fillText('¡Igual que tú me conquistaste a mí! 💛', canvas.width/2, canvas.height/2 + 80);
    ctx.textAlign = 'left';
  }
}

function loop() {
  if (gameState === 'playing') updateGame();
  render();
  gameLoop = requestAnimationFrame(loop);
}

function startGame() {
  initGame();
  gameState = 'playing';
  enemyDir = 1;
  enemySpeed = 0.25;
  enemyShootTimer = 0;
  document.getElementById('startBtn').textContent = '↺ Reiniciar';
  if (!gameLoop) loop();
}

function pauseGame() {
  if (gameState === 'playing') gameState = 'paused';
  else if (gameState === 'paused') gameState = 'playing';
}

function gameOver() {
  gameState = 'gameover';
  document.getElementById('startBtn').textContent = '▶ Jugar de Nuevo';
}

document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === ' ') e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.key] = false; });

// Mobile touch controls
const cw = document.getElementById('gameCanvas');
let touchStartX = null;
cw.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  mobileShoot = true;
  e.preventDefault();
}, { passive: false });
cw.addEventListener('touchmove', e => {
  const dx = e.touches[0].clientX - touchStartX;
  mobileLeft = dx < -5;
  mobileRight = dx > 5;
  e.preventDefault();
}, { passive: false });
cw.addEventListener('touchend', () => {
  mobileLeft = false; mobileRight = false; mobileShoot = false;
});

async function saveLetter(title, content) {

    try {

        const response = await fetch("/api/letters", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                content
            })
        });

        const data = await response.json();

        console.log(data);

    } catch (error) {

        console.error(error);
    }
}

async function loadLetters() {

    try {

        const response = await fetch("/api/letters");

        const letters = await response.json();

        console.log(letters);

        return letters;

    } catch (error) {

        console.error(error);
    }
}

// ===== MUSIC =====
const bgMusic = document.getElementById('bgMusic');

document.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.volume = 0.35;
    bgMusic.play().catch(() => {});
  }
}, { once: true });

// Start idle render
loop();

// ===== MUSIC =====
window.addEventListener('load', () => {
  const music = document.getElementById('bgMusic');

  document.body.addEventListener('click', async () => {
    try {
      music.volume = 0.35;
      await music.play();
    } catch (err) {
      console.log(err);
    }
  }, { once: true });
});