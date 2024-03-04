// GameA WIP from Team One - Charlotte, Chloe, and Emma

// Used Tiled to create the map; art from users on OpenGameArt.org and OpenClipArt.org
// Artists: Jana Ochse, Lanea Zimmerman, Tuomo Untinen, William Thompson, @papapishu, @Gerald_G

// The beginnings of an explorable room -- attempting an interactive puzzle or escape game
// You are musicians who wake up stuck in time loop at the site of their first concert.

// Our design values:
// Easy access
// Win together, lose together
// Goated graphics

let bg;
let bgPortal;
let guests, my, shared;
let move;

let p1;
let p2;
let p3;
let p4;


let music1, music2, music3;

let clue1;

let strokeColor;

let quinqueFont;

const TIMER_DURATION = 500000;

function preload() {
	partyConnect('wss://demoserver.p5party.org', 'team1_gameA');
	guests = partyLoadGuestShareds();
	my = partyLoadMyShared();
	shared = partyLoadShared("globals", {
		gameState: 'intro',
		startTime: Date.now(),
		displayTime: null,
	});

	bg = loadImage('./images/GameAMap2.png');
	bgPortal = loadImage('./images/portal.png');

	p1 = loadImage("./images/p1.png");
    p2 = loadImage("./images/p2.png");
    p3 = loadImage("./images/p3.png");
	p4 = loadImage("./images/p4.png");

}

function setup() {
	createCanvas(640, 640);

	my.x = 294;
	my.y = 610;
	move = 3;

	strokeColor = random(255);
	textFont('QuinqueFive');

	clue1 = true;

	music1 = false;
	music2 = false;
	music3 = false;
}

function draw() {
	// update timer based on host
	if (partyIsHost()) manageTimer();

	if (shared.gameState === 'intro') {
		drawIntroScreen();
	} else if (shared.gameState === 'playing') {
		drawGame();
		drawPlayers();
		checkPressedKeys();
		checkBoundaries();
		messages();
		playMusic();
		checkMusic();
	}

	if (shared.gameState === 'intro' && mouseIsPressed) {
		shared.gameState = 'playing';
	}
}

function drawIntroScreen() {
	background(bgPortal);
	textFont('QuinqueFive');
	textAlign(CENTER);
	textSize(12);
	textLeading(25);
	fill('#000066');
	text('OMG?! We are being teleported!', 200, 165, 250, 350);
	fill('#000066');
	text('No way is this...where we had our first concert?', 200, 280, 250, 350);

	//start button
	push();
	fill('white');
	rect(170, 438, 300, 38, 10);
	fill('#000066');
	text('-click to continue-', 180, 450, 300, 600);
	pop();
}

function drawGame() {
	//map image
	background(bg);

	//'press i for controls' message bottom left
	push();
	fill('white');
	textSize(8);
	textAlign(LEFT);
	text('hold \'i\' for controls', 10, 570, 250, 600);
	if (clue1 === false) {
		text('\'shift\' for clues list', 2, 590, 250, 600);
	}
	pop();

	//game timer
	textSize(12);
	fill('white');
	text(shared.displayTime, 40, 620);
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
		// fill(r, g, b);
		fill(strokeColor);
		rect(guest.x, guest.y, 20, 20);
	}
}

function manageTimer() {
	const elapsed = Date.now() - shared.startTime;
	shared.displayTime = floor((TIMER_DURATION - elapsed) / 1000) + 1;
	if (elapsed > TIMER_DURATION) {
		shared.displayTime = "";
	}
}

// uses common keys to move
function checkPressedKeys() {
	//movement WASD and arrow keys
	if (keyIsDown(LEFT_ARROW) || keyIsDown(65 /*a*/)) {
		my.x -= move;
	} else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68 /*d*/)) {
		my.x += move;
	} else if (keyIsDown(UP_ARROW) || keyIsDown(87 /*w*/)) {
		my.y -= move;
	} else if (keyIsDown(DOWN_ARROW) || keyIsDown(83 /*s*/)) {
		my.y += move;
	} else if (keyIsDown (73)) {  //controls window
		push();
		textAlign(LEFT);
		
		fill('white');
		strokeWeight(3);
		rect(145, 200, 320, 140, 10);

		fill('black');
		textStyle(BOLD);
		textFont('QuinqueFive');
		textSize(8);
		text('WASD or arrow keys to move', 165, 230);
		text('\'E\' to interact', 160, 270);
		text('\'Ctrl\' to reset position', 160, 310);
		pop();
	} else if (keyIsDown(SHIFT)) {
		if (clue1 === false) {
			push();
			strokeWeight(3);
			fill('white');
			rect(134, 350, 340, 120, 10);
			pop();

			push();
			fill('black');
			textSize(8);
			textLeading(12);
			textAlign(LEFT);
			text("Clue 1:", 150, 370, 300);
			text("The hands will tell you all you need to know.", 150, 390, 350);
			pop();
		}
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
	if (my.x < 0) {
		//left wall
		my.x += move;
	} else if (my.x > 619) {
		//right wall
		my.x -= move;
	} else if (my.y < 0) {
		//top wall
		my.y += move;
	} else if (my.y > 619) {
		//bottom wall
		my.y -= move;
	} else if (my.x > 230 && my.x < 350 && my.y < 90) {
		//piano
		move *= -1;
	} else if (my.x < 98 && my.y > 110 && my.y < 195) {
		//left curtain
		move *= -1;
	} else if (my.x > 490 && my.y > 110 && my.y < 195) {
		// right curtain
		move *= -1;
	} else if (my.x > 110 && my.x < 290 && my.y > 140 && my.y < 181) {
		//left stagefront
		move *= -1;
	} else if (my.x > 300 && my.x < 478 && my.y > 140 && my.y < 181) {
		//right stagefront
		move *= -1;
	} else if (my.x > 43 && my.x < 94 && my.y < 67) {
		//top left table
		move *= -1;
	} else if (my.x > 490 && my.x < 610 && my.y < 55) {
		// top right table
		move *= -1;
	} else if (my.x < 30 && my.y > 212 && my.y < 295) {
		//left countertop
		move *= -1;
	} else if (my.x > 588 && my.y > 212 && my.y < 295) {
		//right countertop
		move *= -1;
	} else if (my.x > 80 && my.x < 125 && my.y > 586) {
		//bottom roundtable
		move *= -1;
	} else if (my.x > 555 && my.x < 605 && my.y > 550 && my.y < 605) {
		//chess table
		move *= -1;
	} else {
		move = 3;
	}
}

function messages() {
	// 'door locked' message
	if (my.x > 285 && my.x < 305 && my.y > 610) {
		fill('white');
		rect(248, 580, 125, 30, 5);

		fill('black');
		textFont('QuinqueFive');
		textSize(8);
		text("It's locked!", 313, 598);
	}

	//starting clue
	if (shared.gameState === 'playing' && clue1 === true) {
		push();
		strokeWeight(3);
		fill('white');
		rect(134, 350, 340, 120, 10);
		pop();

		push();
		fill('black');
		textSize(10);
		textLeading(20);
		text("Clue 1:", 50, 360, 300);
		text("The hands will tell you all you need to know.", 160, 390, 300);
		text("(Double click to close)", 160, 445, 300);
		pop();
	} else if (shared.gameState === 'playing' && clue1 === false) {
		return;
	}
}

function doubleClicked() {
	clue1 = false;
}

function playMusic() {
	// play piano
	if (my.x > 280 && my.x < 305 && my.y < 107 && keyIsDown(69)) {
		push();
		fill(255, 251, 0, 30);
		noStroke();
		ellipse(304, 60, 110);
		pop();

		music1 = true;
	}

	// play trumpet
	if (my.x > 408 && my.x < 435 && my.y > 55 && my.y < 85 && keyIsDown(69)) {
		push();
		fill(255, 251, 0, 50);
		noStroke();
		ellipse(430, 75, 40);
		pop();

		music2 = true;
	}

	// play guitar
	if (my.x > 360 && my.x < 400 && my.y > 600 && keyIsDown(69)) {
		push();
		fill(255, 251, 0, 50);
		noStroke();
		ellipse(390, 620, 40);
		pop();

		music3 = true;
	}
}

function checkMusic() {
	if (music1 === true && music2 === true &&  music3 === true) {
		push();
		noStroke();
		fill(255, 251, 0, 50);
		ellipse(592, 585, 100);
		pop();
	}
}
