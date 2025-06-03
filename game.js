window.addEventListener("load", init);

let canvas;
let ctx;
let sheet;

let timerManager = new Array();

let scoreElement;
let timerElement;

let frame = 0;
const frameCount = 6;
let row = 4;
let lastFrameTime = 0;
const frameDelay = 130;
let score = 0;

let isRunning = true;
let timeLeft = 60;
let spawningBalls;

const player = {
    x: 300,
    y: 300,
    speed: 2,
    dx: 0,
    dy: 0,
    catching: false,
    facingLeft: false
};

const keys = {};

const SPRITE_WIDTH = 48;
const SPRITE_HEIGHT = 48;
const SCALE = 2;
const DRAW_WIDTH = SPRITE_WIDTH * SCALE;
const DRAW_HEIGHT = SPRITE_HEIGHT * SCALE;

let balls = new Array();
const ballRadius = 15;

let colorIndex = 0;
const rainbowColors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
let music;

let winScreen;
let playAgainBtn;
let homeBtn2;
let durationBtn2;

function init() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    sheet = new Image();
    sheet.src = "./assets/spritesheet_zoro.png";

    scoreElement = document.getElementById("score");
    timerElement = document.getElementById("timer");

    winScreen = document.getElementById("winScreen");
    playAgainBtn = document.getElementById("playAgainBtn");
    homeBtn2 = document.getElementById("homeBtn2");
    durationBtn2 = document.getElementById("durationBtn2");

    playAgainBtn.addEventListener("click", () => {
        initGame();
    });

    homeBtn2.addEventListener("click", () => {
        window.location.href = "./index.html";
    });

    durationBtn2.addEventListener("click", ()=> {
        if (timeLeft == 60) {
            timeLeft = 120;
            durationBtn2.innerText = "Set Duration To 1 Minute";
        } else {
            timeLeft = 60;
            durationBtn2.innerText = "Set Duration To 2 Minutes";
        }
    })

    document.addEventListener("keydown", (e) => {
      keys[e.key.toLowerCase()] = true;
      if (e.key === " ") player.catching = true;
    });

    document.addEventListener("keyup", (e) => {
      keys[e.key.toLowerCase()] = false;
      if (e.key === " ") player.catching = false;
    });

    let durationButton = document.getElementById("durationBtn");

    durationButton.addEventListener("click", () => {
        if (timeLeft == 60) {
            timeLeft = 120;
            durationButton.innerText = "Set Duration To 1 Minute";
        } else {
            timeLeft = 60;
            durationButton.innerText = "Set Duration To 2 Minutes";
        }
        timerElement.innerText = "Time Left: " + timeLeft;
    });

    document.getElementById("startBtn").addEventListener("click", () => {
    document.querySelector(".start-screen").style.display = "none";
    document.querySelector("h1").style.display = "block";
    document.querySelector(".main-wrapper").style.display = "flex";

    initGame();
});
}

function initGame() {
    balls = [];
    player.x = 300;
    player.y = 300;

    score = 0;
    timerElement.innerText = "Time Left: " + timeLeft;
    music = new Audio("./assets/start.mp3");
    isRunning = true;

    startAutoFiring();
    requestAnimationFrame(gameLoop);
    winScreen.style.display = 'none';

    music.volume = 0.5;
    music.play();

    const timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = "Time Left: " + timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      clearInterval(spawningBalls);
      timerElement.textContent = "Time's up!";
      isRunning = false;
      timeLeft = 60;

      winScreen.style.display = "block";

      const lowerVolume = setInterval(() => {
        music.volume -= 0.05;

        if (music.volume <= 0.05) {
            let end = new Audio("./assets/ending.mp4");

            clearInterval(lowerVolume);
            music.pause();

            end.play();
        }
      }, 50);


    }
  }, 1000);
}

function updateDirection() {
    let dx = 0, dy = 0;
    if (keys["w"]) dy = -1;
    if (keys["s"]) dy = 1;
    if (keys["a"]) dx = -1;
    if (keys["d"]) dx = 1;

    player.dx = dx;
    player.dy = dy;

    // Movement rows logic per character sheet:
    // row 0 - swimming and catching (row 1)
    // row 1 - swimming diagonally catching (row 2)
    // row 2 - idle swim catching (row 3)
    // row 3 - game over (row 4) - not used here
    // row 4 - idle swim (row 5)
    // row 5 - swimming (right) (row 6)
    // row 6 - swimming diagonally (north-east) (row 7)
    // row 7 - swimming diagonally down catching (south-east) (row 8)
    // row 8 - swimming diagonally down (south-east) (row 9)

    if (dx === 0 && dy === 0) {
    // No movement
    if (player.catching) {
        row = 2; // idle swim catching
    } else {
        row = 4; // idle swim
    }
    } else {
    // Moving
    if (player.catching) {
        // Catching + movement
        if (dx > 0 && dy === 0) {
        row = 0; // swimming and catching
        } else if (dx > 0 && dy < 0) {
        row = 1; // swimming diagonally catching (north-east)
        } else if (dx > 0 && dy > 0) {
        row = 7; // swimming diagonally down catching (south-east)
        } else if (dx < 0 && dy === 0) {
        row = 0; // swimming and catching (flip for left)
        } else if (dx < 0 && dy < 0) {
        row = 1; // swimming diagonally catching (north-east) flip horizontal for north-west
        } else if (dx < 0 && dy > 0) {
        row = 7; // swimming diagonally down catching (south-east) flip horizontal for south-west
        } else {
        row = 0; // fallback swimming and catching
        }
    } else {
        // Moving not catching
        if (dx > 0 && dy === 0) {
        row = 5; // swimming right
        } else if (dx > 0 && dy < 0) {
        row = 6; // swimming diagonally north-east
        } else if (dx > 0 && dy > 0) {
        row = 8; // swimming diagonally down south-east
        } else if (dx < 0 && dy === 0) {
        row = 5; // swimming (right) flipped for left
        } else if (dx < 0 && dy < 0) {
        row = 6; // swimming diagonally north-east flipped for north-west
        } else if (dx < 0 && dy > 0) {
        row = 8; // swimming diagonally down south-east flipped for south-west
        } else {
        row = 5; // fallback swimming right
        }
    }
    }

    player.facingLeft = dx < 0;

    player.x += dx * player.speed;
    player.y += dy * player.speed;

    player.x = Math.max(0, Math.min(canvas.width - DRAW_WIDTH, player.x));
    player.y = Math.max(0, Math.min(canvas.height - DRAW_HEIGHT, player.y));
}

function drawFrame() {
    ctx.save();
    ctx.translate(player.x + (player.facingLeft ? DRAW_WIDTH : 0), player.y);
    if (player.facingLeft) ctx.scale(-1, 1);
    ctx.drawImage(sheet, frame * SPRITE_WIDTH, row * SPRITE_HEIGHT, SPRITE_WIDTH, SPRITE_HEIGHT, 0, 0, DRAW_WIDTH, DRAW_HEIGHT);
    ctx.restore();
}

function drawBall() {
    let ballX;
    let ballY;

    for (let i = 0; i < balls.length; i++) {
        ballX = balls[i].ballX;
        ballY = balls[i].ballY;
        let radius = balls[i].ballRadius;

        const gradient = ctx.createRadialGradient(
            ballX, ballY, 0,
            ballX, ballY, radius
        );

        gradient.addColorStop(0, "white");
        gradient.addColorStop(1, rainbowColors[balls[i].colorIndex]);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ballX, ballY, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function updateBall() {
    for (let i = 0; i < balls.length; i++) {
        if (balls[i].sinking) {
            if (balls[i].ticks < 400) {
                balls[i].ticks++
                continue;
            }

            if (balls[i].ballRadius > 0.5) {
                  balls[i].ballRadius -= 0.05;
            } else {
                balls.splice(i, 1);
                updateLaunch = false;
            }
        }

        if (balls[i].ballY <= balls[i].desiredY) {
            balls[i].ballY++;
        } else {
            balls[i].launching = false;
            balls[i].sinking = true;
        }
    }
}

function checkCollision() {
    if (!player.catching) return;
    
    for (let i = 0; i < balls.length; i++) {
        const px = player.x + DRAW_WIDTH / 2;
        const py = player.y + DRAW_HEIGHT / 2;
        if (Math.abs(balls[i].ballX - px) < DRAW_WIDTH / 2 && Math.abs(balls[i].ballY - py) < DRAW_HEIGHT / 2) {
            balls.splice(i, 1);
            score += Number(10);

            let sound = new Audio("./assets/success.mp3");
            sound.play();

            return;
        }
    }
}

function spawnBall() {
    let ballX = Math.random() * (canvas.width - 30) + 15;
    let ballY = 25;
    colorIndex = (colorIndex + 1) % rainbowColors.length;
    let desiredY = Math.random() * (Math.random() * (canvas.height - 200) + 200);

    balls.push({
        ballX: ballX,
        ballY: ballY,
        ballRadius: ballRadius,
        colorIndex: colorIndex,
        desiredY: desiredY,
        launching: true,
        sinking: false,
        ticks: 0
    });
}

function startAutoFiring() {
    spawningBalls = setInterval(spawnBall, 500);
}

function updateTimer() {
    for (let i = 0; i < timerManager.length; i++) {
        timerManager[i].tick++;
        
        if (timerManager[i].duration <= timerManager[i].tick) {
            timerManager[i].outcome();
            timerManager.splice(i, 1);
        }
    }
}

function gameLoop(timestamp) {
    updateTimer();
    updateBall();
    updateDirection();
    checkCollision();

    scoreElement.innerText = "Score: " + score;

    scoreSound();

    if (timestamp - lastFrameTime > frameDelay) {
    frame = (frame + 1) % frameCount;
    lastFrameTime = timestamp;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawFrame();
    if (isRunning) requestAnimationFrame(gameLoop);
}

let reach100 = false;
let reach200 = false;
let bigScore = 300;

function scoreSound() {
    if (score == 100 && !reach100) {
        let sound = new Audio("./assets/100.mp4");

        sound.play();

        reach100 = true;
    }
    else if (score == 200 && !reach200) {
        let sound = new Audio("./assets/200.mp4");

        sound.play();

        reach200 = true;
    }
    else if (score == bigScore) {
        let sound = new Audio("./assets/300.mp4");

        sound.play();

        bigScore += 50;
    }
}