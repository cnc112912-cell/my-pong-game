const container = document.getElementById("game-container");
const player = document.getElementById("player-paddle");
const ai = document.getElementById("ai-paddle");
const ball = document.getElementById("ball");
const playerScoreBoard = document.getElementById("player-score");
const aiScoreBoard = document.getElementById("ai-score");
const endScreen = document.getElementById("game-over-screen");
const endText = document.getElementById("game-over-text");
const powerupAlert = document.getElementById("powerup-alert");

let ballX = 292, ballY = 192;
let ballSpeedX = 4, ballSpeedY = 4;
let playerY = 160, aiY = 160;
let playerScore = 0, aiScore = 0;
let gameActive = true;

let hitCount = 0;
let timeSlowActive = false;
let normalSpeedX = 4, normalSpeedY = 4;
let keysPressed = {};

// NEW: Variables for the AI's independent movement pattern
let aiDirection = 1; 

container.addEventListener("mousemove", (e) => {
  if (!gameActive) return;
  const rect = container.getBoundingClientRect();
  playerY = e.clientY - rect.top - 40;
  playerY = Math.max(0, Math.min(320, playerY));
  player.style.top = playerY + "px";
});

window.addEventListener("keydown", (e) => { keysPressed[e.key] = true; });
window.addEventListener("keyup", (e) => { keysPressed[e.key] = false; });

powerupAlert.addEventListener("click", () => {
  if (hitCount < 3 || timeSlowActive) return;
  
  timeSlowActive = true;
  powerupAlert.style.display = "none";
  ball.style.backgroundColor = "#ff3b30"; 
  
  normalSpeedX = ballSpeedX;
  normalSpeedY = ballSpeedY;
  ballSpeedX = ballSpeedX > 0 ? 1 : -1;
  ballSpeedY = ballSpeedY > 0 ? 0.5 : -0.5;

  setTimeout(() => {
    if (timeSlowActive) disablePowerup();
  }, 4000);
});

function disablePowerup() {
  timeSlowActive = false;
  hitCount = 0;
  ball.style.backgroundColor = "#ffcc00"; 
  ballSpeedX = ballSpeedX > 0 ? Math.abs(normalSpeedX) : -Math.abs(normalSpeedX);
  ballSpeedY = ballSpeedY > 0 ? Math.abs(normalSpeedY) : -Math.abs(normalSpeedY);
}

function update() {
  if (!gameActive) return;

  if (timeSlowActive) {
    if (keysPressed["ArrowUp"]) ballY -= 3.5;
    if (keysPressed["ArrowDown"]) ballY += 3.5;
  }

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballY <= 0 || ballY >= 385) ballSpeedY *= -1;

  // FIXED: AI ignores the ball! It just glides up and down blindly.
  aiY += 3 * aiDirection;
  if (aiY <= 0 || aiY >= 320) {
    aiDirection *= -1; // Reverse direction when hitting walls
  }
  ai.style.top = aiY + "px";

  if (ballX <= 35 && ballY + 15 >= playerY && ballY <= playerY + 80) {
    ballSpeedX = Math.abs(ballSpeedX) * 1.05; 
    registerHit();
  }
  if (ballX >= 550 && ballY + 15 >= aiY && ballY <= aiY + 80) {
    ballSpeedX = -Math.abs(ballSpeedX) * 1.05; 
    registerHit();
  }

  if (ballX < 0) {
    aiScore++;
    aiScoreBoard.innerText = aiScore;
    if (timeSlowActive) disablePowerup();
    checkWinCondition();
  } else if (ballX > 600) {
    playerScore++;
    playerScoreBoard.innerText = playerScore;
    if (timeSlowActive) disablePowerup();
    checkWinCondition();
  }

  ball.style.left = ballX + "px";
  ball.style.top = ballY + "px";
  requestAnimationFrame(update);
}

function registerHit() {
  if (timeSlowActive) return; 
  hitCount++;
  if (hitCount >= 3) {
    powerupAlert.style.display = "block"; 
  }
}

function checkWinCondition() {
  if (playerScore >= 5) showEndScreen("YOU WIN! 🎉", "#4cd964");
  else if (aiScore >= 5) showEndScreen("GAME OVER 💀", "#ff3b30");
  else resetBall();
}

function showEndScreen(message, textColor) {
  gameActive = false;
  powerupAlert.style.display = "none";
  endText.innerText = message;
  endText.style.color = textColor;
  endScreen.style.display = "flex";
}

function resetBall() {
  hitCount = 0;
  powerupAlert.style.display = "none";
  ballX = 292; ballY = 192;
  ballSpeedX = 4 * (ballSpeedX > 0 ? -1 : 1);
  ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
}

endScreen.addEventListener("click", () => {
  playerScore = 0; aiScore = 0;
  playerScoreBoard.innerText = "0";
  aiScoreBoard.innerText = "0";
  endScreen.style.display = "none";
  gameActive = true;
  resetBall();
  update();
});

update();
