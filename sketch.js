// GameA WIP from Team One - Charlotte, Chloe, and Emma

// Used Tiled to create the map; art from users on OpenGameArt.org and OpenClipArt.org
// Artists: Jana Ochse, Lanea Zimmerman, Tuomo Untinen, William Thompson, @papapishu, @Gerald_G

// The beginnings of an explorable room -- attempting an interactive puzzle or escape game
// Code inspired by d12 https://p5party.org/examples/d12/

// Our design values:
// Easy access
// Win together, lose together
// Goated graphics

let bg;
let guests, my, shared;
let move;
let r, g, b;

function preload() {
  partyConnect("wss://demoserver.p5party.org", "team1_gameA");
  guests = partyLoadGuestShareds();
  my = partyLoadMyShared();
  shared = partyLoadShared("shared", {});

  // DESIGN VALUE: Goated graphics
  bg = loadImage("./assets/GameAMap2.png");
}

function setup() {
  createCanvas(640, 640);

  my.x = 294;
  my.y = 610;
  move = 3;

  r = random(255);
  g = random(255);
  b = random(255);
}

function draw() {
  drawGame();
  drawPlayers();
  checkPressedKeys();
  checkBoundaries();
  messages();
}

function drawGame() {
  //map image
  background(bg);
  
  //pos reset key, bottom right of screen
  push();
  fill("white");
  textStyle(BOLD);
  textFont("Courier New");
  textSize(11);
  text("(Ctrl to reset position)", 475, 630)
  pop();
}

function drawPlayers() {
  //draw entryway
  push();
  noStroke();
  fill(63, 24, 1);
  rect(289, 632, 30, 7, 4);
  pop();

  //initialize players
  for (const guest of guests) {
    fill(r, g, b);
    rect(guest.x, guest.y, 20, 20);
  }
}

// DESIGN VALUE: Easy access
// uses common keys to move
function checkPressedKeys() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65 /*a*/)) {
    my.x -= move;
  } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68 /*d*/)) {
    my.x += move;
  } else if (keyIsDown(UP_ARROW) || keyIsDown(87 /*w*/)) {
    my.y -= move;
  } else if (keyIsDown(DOWN_ARROW) || keyIsDown(83 /*s*/)) {
    my.y += move;
  } else my.keysReleasedSinceAction = true;
}

function keyPressed() {
  //reset position with 'Ctrl' key
  if (keyCode === CONTROL) {
    my.x = 294;
    my.y = 610;
    redraw();
  }
}

function checkBoundaries() {
  if (my.x < 0) { //left wall
    my.x += move;
  } else if (my.x > 619) { //right wall
    my.x -= move;
  } else if (my.y < 0) { //top wall
    my.y += move;
  } else if (my.y > 619) { //bottom wall
    my.y -= move;
  } else if (my.x > 230 && my.x < 350 && my.y < 90) { //piano
    move *= -1;
  } else if (my.x < 98 && my.y > 110 && my.y < 195) { //left curtain
    move *= -1;
  } else if (my.x > 490 && my.y > 110 && my.y < 195) { // right curtain
    move *= -1;
  } else if (my.x > 110 && my.x < 290 && my.y > 140 && my.y < 181) { //left stagefront
    move *= -1;
  } else if (my.x > 300 && my.x < 478 && my.y > 140 && my.y < 181) { //right stagefront
    move *= -1;
  } else if (my.x > 43 && my.x < 94 && my.y < 67) { //top left table
    move *= -1;
  } else if (my.x > 490 && my.x < 610 && my.y < 55) { // top right table
    move *= -1;
  } else if (my.x < 30 && my.y > 212 && my.y < 295) { //left countertop
    move *= -1;
  } else if (my.x > 588 && my.y > 212 && my.y < 295) { //right countertop
    move *= -1;
  } else if (my.x > 80 && my.x < 125 && my.y > 586) { //bottom roundtable
    move *= -1;
  } else if (my.x > 555 && my.x < 605 && my.y > 550 && my.y < 605) { //chess table
    move *= -1;
  } else {
    move = 3;
  }
}

function messages() {
  // 'door locked' message
  if (my.x > 285 && my.x < 305 && my.y > 610) {
    fill("white");
    rect(258, 580, 100, 30, 5);
    
    fill("black");
    textStyle(BOLDITALIC);
    textFont("Courier New");
    text("It's locked!", 265, 598);
  }
}
