const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.imageSmoothingEnabled = false;

/* =========================
   IMAGES
========================= */

const room = new Image();
room.src = "assets/room_background.png";

const logo = new Image();
logo.src = "assets/logo.png";

const playerIdle = new Image();
playerIdle.src = "assets/player_idle.png";

const playerWalk = new Image();
playerWalk.src = "assets/player_walk.png";

const ui = {
  chat: new Image(),
  friends: new Image(),
  notifications: new Image(),
  reactions: new Image(),
  shop: new Image()
};

ui.chat.src = "assets/ui/chat.png";
ui.friends.src = "assets/ui/friends.png";
ui.notifications.src = "assets/ui/notifications.png";
ui.reactions.src = "assets/ui/reactions.png";
ui.shop.src = "assets/ui/shop.png";

/* =========================
   CAMERA / ZOOM
========================= */

let zoom = 0.75;

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();

  if (e.deltaY < 0) {
    zoom += 0.05;
  } else {
    zoom -= 0.05;
  }

  zoom = Math.max(0.4, Math.min(1.5, zoom));
});

/* =========================
   PLAYER
========================= */

const player = {
  x: 760,
  y: 470,

  targetX: 760,
  targetY: 470,

  speed: 2,

  moving: false,

  frame: 0,
  frameTimer: 0,

  frameWidth: 256,
  frameHeight: 256,

  totalFrames: 4
};

/* =========================
   CLICK TO MOVE
========================= */

canvas.addEventListener("click", (e) => {

  const rect = canvas.getBoundingClientRect();

  const roomScale = 0.75 * zoom;

  const roomWidth = room.width * roomScale;
  const roomHeight = room.height * roomScale;

  const roomX = canvas.width / 2 - roomWidth / 2;
  const roomY = canvas.height / 2 - roomHeight / 2;

  player.targetX =
    (e.clientX - rect.left - roomX) / roomScale;

  player.targetY =
    (e.clientY - rect.top - roomY) / roomScale;

});

/* =========================
   UPDATE PLAYER
========================= */

function updatePlayer() {

  const dx = player.targetX - player.x;
  const dy = player.targetY - player.y;

  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 2) {

    player.moving = true;

    player.x += (dx / dist) * player.speed;
    player.y += (dy / dist) * player.speed;

  } else {

    player.moving = false;

  }

  if (player.moving) {

    player.frameTimer++;

    if (player.frameTimer > 10) {

      player.frame++;

      if (player.frame >= player.totalFrames) {
        player.frame = 0;
      }

      player.frameTimer = 0;
    }

  }

}

/* =========================
   DRAW ROOM
========================= */

function drawRoom() {

  const roomScale = 0.75 * zoom;

  const roomWidth = room.width * roomScale;
  const roomHeight = room.height * roomScale;

  const roomX = canvas.width / 2 - roomWidth / 2;
  const roomY = canvas.height / 2 - roomHeight / 2;

  ctx.drawImage(
    room,
    roomX,
    roomY,
    roomWidth,
    roomHeight
  );

  drawPlayer(roomX, roomY, roomScale);

}

/* =========================
   DRAW PLAYER
========================= */

function drawPlayer(roomX, roomY, roomScale) {

  const scale = 0.20 * zoom;

  const px = roomX + player.x * roomScale;
  const py = roomY + player.y * roomScale;

  if (player.moving) {

    ctx.drawImage(

      playerWalk,

      player.frame * player.frameWidth,
      0,

      player.frameWidth,
      player.frameHeight,

      px,
      py,

      player.frameWidth * scale,
      player.frameHeight * scale

    );

  } else {

    ctx.drawImage(

      playerIdle,

      px,
      py,

      playerIdle.width * scale,
      playerIdle.height * scale

    );

  }

}

/* =========================
   DRAW UI
========================= */

function drawUI() {

  ctx.drawImage(logo, 25, 25, 180, 180);

  ctx.drawImage(
    ui.chat,
    40,
    canvas.height - 250,
    280,
    180
  );

  ctx.drawImage(
    ui.notifications,
    canvas.width - 340,
    40,
    300,
    160
  );

  ctx.drawImage(
    ui.friends,
    canvas.width - 140,
    220,
    90,
    90
  );

  ctx.drawImage(
    ui.shop,
    canvas.width - 140,
    330,
    90,
    90
  );

  ctx.drawImage(
    ui.reactions,
    canvas.width / 2 - 150,
    canvas.height - 110,
    300,
    70
  );

}

/* =========================
   GAME LOOP
========================= */

function gameLoop() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();

  drawRoom();

  drawUI();

  requestAnimationFrame(gameLoop);

}

/* =========================
   START
========================= */

room.onload = () => {
  gameLoop();
};

/* =========================
   RESIZE
========================= */

window.addEventListener("resize", () => {

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

});