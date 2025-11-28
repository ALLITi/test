const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const restartBtn = document.getElementById("restart");

const gridSize = 24;
const tileCount = canvas.width / gridSize;
const HIGH_SCORE_KEY = "snake-high-score";

let snake;
let velocity;
let food;
let score;
let loop;
let highScore = 0;

function loadHighScore() {
  const stored = Number.parseInt(localStorage.getItem(HIGH_SCORE_KEY), 10);
  return Number.isFinite(stored) && stored > 0 ? stored : 0;
}

function resetGame() {
  highScore = loadHighScore();
  snake = [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ];
  velocity = { x: 1, y: 0 };
  score = 0;
  spawnFood();
  updateScore();
  clearInterval(loop);
  loop = setInterval(update, 90);
}

function update() {
  const head = {
    x: snake[0].x + velocity.x,
    y: snake[0].y + velocity.y,
  };

  if (isCollision(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    updateScore();
    spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "var(--snake-head)" : "var(--snake)";
    drawRoundedRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize, 6);
  });

  ctx.fillStyle = "var(--accent)";
  drawRoundedRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize, 8);
}

function drawGrid() {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  ctx.lineWidth = 1;

  for (let i = 0; i < tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
}

function drawRoundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function spawnFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));

  food = newFood;
}

function isCollision(head) {
  const hitWall = head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount;
  const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);
  return hitWall || hitSelf;
}

function endGame() {
  clearInterval(loop);
  loop = undefined;
  ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "var(--danger)";
  ctx.textAlign = "center";
  ctx.font = "bold 26px Inter, system-ui, sans-serif";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 10);
  ctx.fillStyle = "var(--text)";
  ctx.font = "16px Inter, system-ui, sans-serif";
  ctx.fillText("Press Restart or Space to play again", canvas.width / 2, canvas.height / 2 + 16);
}

function updateScore() {
  scoreEl.textContent = score.toString();
  if (score > highScore) {
    highScore = score;
    localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
  }
  highScoreEl.textContent = highScore.toString();
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();
  if (["arrowup", "w"].includes(key) && velocity.y !== 1) {
    velocity = { x: 0, y: -1 };
  } else if (["arrowdown", "s"].includes(key) && velocity.y !== -1) {
    velocity = { x: 0, y: 1 };
  } else if (["arrowleft", "a"].includes(key) && velocity.x !== 1) {
    velocity = { x: -1, y: 0 };
  } else if (["arrowright", "d"].includes(key) && velocity.x !== -1) {
    velocity = { x: 1, y: 0 };
  } else if (key === " " && !loop) {
    resetGame();
  }
}

restartBtn.addEventListener("click", resetGame);
document.addEventListener("keydown", handleKeydown);

resetGame();
