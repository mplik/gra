const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const startButton = document.getElementById('start-button');
const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const liveDisplay = document.getElementById('lives');

// Załaduj dźwięk strzału
const shootSoundEffect = new Audio('assets/laser.mp3');

// Załaduj dźwięk tła
const backgroundMusic = new Audio('assets/sounds/retro_video_game.mp3');
backgroundMusic.loop = true;


let score = 0;
let lives = 3;
let isGameRunning = false;

const spaceship = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    speed: 7,
    dx: 0,
    dy: 0
};

const bullets = [];
const enemies = [];
const enemySpeed = 2;

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}


function drawSpaceship() {
    // Rysowanie statku kosmicznego
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(spaceship.x, spaceship.y);
    ctx.lineTo(spaceship.x + spaceship.width / 2, spaceship.y - spaceship.height);
    ctx.lineTo(spaceship.x + spaceship.width, spaceship.y);
    ctx.closePath();
    ctx.fill();

    // Dodanie szczegółów do statku kosmicznego
    ctx.fillStyle = 'red';
    ctx.fillRect(spaceship.x + 10, spaceship.y - 5, 10, 5); // lewy laser
    ctx.fillRect(spaceship.x + spaceship.width - 20, spaceship.y - 5, 10, 5); // prawy laser
}

function moveSpaceship() {
    spaceship.x += spaceship.dx;
    spaceship.y += spaceship.dy;

    if (spaceship.x < 0) {
        spaceship.x = 0;
    } else if (spaceship.x + spaceship.width > canvas.width) {
        spaceship.x = canvas.width - spaceship.width;
    }
}

function drawBullets() {
    bullets.forEach((bullet, index) => {
        ctx.fillStyle = 'orange';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        bullet.y -= bullet.speed;

        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
}

function shootBullet() {
    // Strzelanie dwoma pociskami jednocześnie
    bullets.push({
        x: spaceship.x + 10, // Lewy pocisk
        y: spaceship.y,
        width: 5,
        height: 10,
        speed: 7
    });
    bullets.push({
        x: spaceship.x + spaceship.width - 15, // Prawy pocisk
        y: spaceship.y,
        width: 5,
        height: 10,
        speed: 7
    });

    // Odtwórz dźwięk strzału
    shootSoundEffect.play();
}

function drawEnemies() {
    enemies.forEach((enemy, index) => {
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        enemy.y += enemySpeed;

        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
            lives--;
            updateLives();
            if (lives <= 0) {
                gameOver();
                restartGameAfterDelay(); // Restart gry po 3 sekundach
            }
        }

        bullets.forEach((bullet, bulletIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(index, 1);
                score++;
                updateScore();
            }
        });
    });
}

function updateScore() {
    scoreDisplay.textContent = score;
}

function updateLives() {
    liveDisplay.textContent = lives;
}

function gameOver() {
    isGameRunning = false;
    alert("Koniec gry! Zdobyte punkty: " + score); // Wyświetl alert z wynikiem
    saveScore(score); // Zapisanie wyniku po zakończeniu gry
    resetGame(); // Zresetowanie gry
}

function resetGame() {
    score = 0;
    lives = 3;
    updateScore();
    updateLives();
    enemies.length = 0;
    bullets.length = 0;
}

function resetGame() {
    score = 0;
    lives = 3;
    updateScore();
    updateLives();
    enemies.length = 0;
    bullets.length = 0;
}

function spawnEnemy() {
    const enemy = {
        x: Math.random() * (canvas.width - 30),
        y: 0,
        width: 30,
        height: 30,
        speed: 2
    };
    enemies.push(enemy);
}

function gameLoop() {
    if (isGameRunning) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSpaceship();
        moveSpaceship();
        drawBullets();
        drawEnemies();
        requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    isGameRunning = true;
    gameContainer.style.display = 'block';
    mainMenu.style.display = 'none';
    spawnEnemy();
    setInterval(spawnEnemy, 1000);
    gameLoop();
}

document.getElementById('start-button').addEventListener('click', startGame);

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'd') {
        spaceship.dx = spaceship.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        spaceship.dx = -spaceship.speed;
    } else if (e.key === ' ') {
        shootBullet();
    }
});

document.addEventListener('keyup', e => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'ArrowLeft' || e.key === 'a') {
        spaceship.dx = 0;
    }
});

// Obsługa dotykowych przycisków
document.getElementById('left-button').addEventListener('touchstart', function () {
    spaceship.dx = -spaceship.speed;
});

document.getElementById('left-button').addEventListener('touchend', function () {
    spaceship.dx = 0;
});

document.getElementById('right-button').addEventListener('touchstart', function () {
    spaceship.dx = spaceship.speed;
});

document.getElementById('right-button').addEventListener('touchend', function () {
    spaceship.dx = 0;
});

document.getElementById('shoot-button').addEventListener('touchstart', function () {
    shootBullet();
});

const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

function saveScore(score) { // Zapisanie wyniku do listy najlepszych wyników
    const playerName = prompt('Podaj swoje imię:'); // Pobranie imienia gracza
    const newScore = { name: playerName, score }; // Utworzenie nowego wyniku
    leaderboard.push(newScore); // Dodanie wyniku do listy najlepszych wyników
    leaderboard.sort((a, b) => b.score - a.score); // Posortowanie listy najlepszych wyników
    leaderboard.splice(10); // Ograniczenie listy najlepszych wyników do 10 wyników
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard)); // Zapisanie listy najlepszych wyników w pamięci lokalnej
    updateLeaderboard(); // Aktualizacja listy najlepszych wyników
}

function updateLeaderboard() {  // Aktualizacja listy najlepszych wyników
    const leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = leaderboard.map(entry => `<li>${entry.name}: ${entry.score}</li>`).join('');
}

// Aktualizacja listy najlepszych wyników po załadowaniu strony frymowana w funkcji updateLeaderboard
window.onload = updateLeaderboard;
