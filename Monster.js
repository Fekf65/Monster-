const restartBtn = document.getElementById("restart-btn");
const gameContainer = document.getElementById("game-container");
const monster = document.getElementById("monster");
const player = document.getElementById("player");
let playerHealth = 100;
let monsterHealth = 100;
let isMovingLeft = false;
let isMovingRight = false;
let playerLeft = 360;
const playerSpeed = 8;
let monsterLeft = 350;

let isDead = false;

let gameActive = true;
let monsterMovementTimer;
let fireballTimer;
let animationFrameId;

  
function initGame() {
  clearInterval(monsterMovementTimer);
  clearInterval(fireballTimer);

  monster.style.left = 350 + "px";
  player.style.left = 360 + "px";

  monsterMovementTimer = setInterval(monsterMovement, 2000);
  fireballTimer = setInterval(createFireball, 3000);

  gameLoop();
}

restartBtn.addEventListener("click", () => {
  resetGame();
});

function monsterMovement() {
  if (!gameActive) return;
  const moveAmount = 50;
  const direction = Math.random() > 0.5 ? 1 : -1;//ai
  monsterLeft = Math.max(
    0,
    Math.min(
      gameContainer.offsetWidth - monster.offsetWidth,
      monsterLeft + direction * moveAmount
    )//ai
  );
  monster.style.left = monsterLeft + "px";
}

document.addEventListener("keydown", (e) => {
  if (!gameActive) return;
  if (e.key === "ArrowLeft") isMovingLeft = true;
  if (e.key === "ArrowRight") isMovingRight = true;
  if (e.key === "ArrowUp") shootGrenade();
});//ai

document.addEventListener("keyup", (e) => {
  if (!gameActive) return;
  if (e.key === "ArrowLeft") isMovingLeft = false;
  if (e.key === "ArrowRight") isMovingRight = false;
});//ai

function gameLoop() {
  if (!gameActive) return;
  if (isMovingLeft) playerLeft = Math.max(0, playerLeft - playerSpeed);
  if (isMovingRight)
    playerLeft = Math.min(
      gameContainer.offsetWidth - player.offsetWidth,
      playerLeft + playerSpeed
    );
  player.style.left = playerLeft + "px";
  animationFrameId = requestAnimationFrame(gameLoop);
}

function createFireball() {
  if (!gameActive) return;
  const mouthX = monsterLeft + 50;
  const fireball = document.createElement("div");
  fireball.className = "projectile";
  fireball.style.cssText = `
                background-color: #f00;
                left: ${mouthX - 10}px;
                top: 85px;
            `;
  gameContainer.appendChild(fireball);

  let pos = 85;
  const fall = setInterval(() => {
    pos += 5;
    fireball.style.top = pos + "px";
    if (checkCollision(fireball, player)) {
      playerHealth = Math.max(0, playerHealth - 10);
      updateHealth("player");
      fireball.remove();
      clearInterval(fall);
    }
    if (pos > 600) {
      fireball.remove();
      clearInterval(fall);
    }
  }, 20);
}

function shootGrenade() {
  if (!gameActive) return;
  const grenade = document.createElement("div");
  grenade.className = "projectile";
  grenade.style.cssText = `
                background-color: #00f;
                left: ${playerLeft + 30}px;
                top: ${player.offsetTop - 20}px;//ai
            `;
  gameContainer.appendChild(grenade);//ai

  let pos = player.offsetTop - 20;
  const rise = setInterval(() => {
    pos -= 10;
    grenade.style.top = pos + "px";
    if (checkCollision(grenade, monster)) {
      monsterHealth = Math.max(0, monsterHealth - 10);
      updateHealth("monster");
      grenade.remove();
      clearInterval(rise);
    }
    if (pos < -20) {
      grenade.remove();
      clearInterval(rise);
    }
  }, 20);
}

function checkCollision(element1, element2) {
  if (!gameActive) return false;
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();
  return !(
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom ||
    rect1.right < rect2.left ||
    rect1.left > rect2.right
  );
}

function updateHealth(type) {
  const healthBar =
    type === "player"
      ? document.querySelector("#player .health-fill")
      : document.querySelector("#monster .health-fill");
  const clampedHealth = Math.max(
    0,
    Math.min(100, type === "player" ? playerHealth : monsterHealth)
  );//ai
  healthBar.style.width = clampedHealth + "%";
  if (clampedHealth <= 0) endGame();
}

function resetGame() {
  playerHealth = monsterHealth = 100;
  playerLeft = monsterLeft = 350;
  isDead = false;

  updateHealth("player");
  updateHealth("monster");

  player.classList.remove("dead");
  monster.classList.remove("dead");

  monster.style.left = monsterLeft + "px";
  player.style.left = playerLeft + "px";

  document
    .querySelectorAll(".projectile, .explosion")
    .forEach((el) => el.remove());
  restartBtn.style.display = "none";
  document.getElementById("message").style.display = "none";//ai
  gameActive = true;
  initGame();
}

function endGame() {
  if (!gameActive) return;

  gameActive = false;
  isDead = true;
 clearInterval(monsterMovementTimer);
  clearInterval(fireballTimer);
  cancelAnimationFrame(animationFrameId);
  if (playerHealth <= 0) {
    player.classList.add("dead");
    showMessage("BOSS WINS");
  } else {
    monster.classList.add("dead");
    showMessage("PLAYER WINS");
  }

  restartBtn.style.display = "block";
}

function showMessage(text) {
  const msg = document.getElementById("message");
  msg.textContent = text;
  msg.style.display = "block";
}

initGame();
