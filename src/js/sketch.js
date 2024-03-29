// GameA WIP from Team One - Charlotte, Chloe, and Emma

// The beginnings of an explorable room -- attempting an interactive puzzle or escape game
// You are musicians who wake up stuck in time loop at the site of their first concert.

// Our design values:
// Easy access
// Win together, lose together
// Goated graphics

let bg;
let bgPortal;
let startScreen;
let guests, my, shared;
//sharedMusic

let move;

let characters = [];
let charactersleft = [];
let characterId;

let music1, music2, music3;
let musicPlayState = false;
let nearClueForMusic = false;

let clue1, clue2, clue3, clue4, clue5, clue6;
let clockface;
let chess;

let strokeColor;

let quinqueFont;

var startOverSound;

const TIMER_DURATION = 400000;

function preload() {
	partyConnect("wss://demoserver.p5party.org", "team1_gameA");
	guests = partyLoadGuestShareds();
	my = partyLoadMyShared();
	shared = partyLoadShared("globals", {
		gameState: "title",
		startTime: Date.now(),
		displayTime: null,
		clue6: false,
	});
	// sharedMusic = partyLoadShared("shared", {
	// 	music1: false,
	// 	music2: false,
	// 	music3: false,
	// });

	// music1 = false;
	music1 = loadSound("./sounds/snippets/sound_snippet_1.mp4");
	music2 = loadSound("./sounds/snippets/sound_snippet.mp4");
	music3 = loadSound("./sounds/snippets/sound_snippet_4.mp3");

	bg = loadImage("./images/map.png");
	bgPortal = loadImage("./images/portal.png");
	startScreen = loadImage("./images/start_screen.jpg");

	characters[0] = loadImage("./images/p1.png");
	characters[1] = loadImage("./images/p2.png");
	characters[2] = loadImage("./images/p3.png");
	characters[3] = loadImage("./images/p4.png");

	charactersleft[0] = loadImage("./images/p1-left.png");
	charactersleft[1] = loadImage("./images/p2-left.png");
	charactersleft[2] = loadImage("./images/p3-left.png");
	charactersleft[3] = loadImage("./images/p4-left.png");

	clockface = loadImage("./images/clockface.jpg");

	chess = loadImage("./images/chess.png");
}

function setup() {
	createCanvas(640, 640);

	my.x = 294;
	my.y = 610;
	move = 3;

	strokeColor = random(255);
	textFont("QuinqueFive");

	clue1 = true;
	clue2 = true;
	clue3 = true;
	clue4 = true;
	clue5 = true;

	my.characterId = floor(random(4));
}

function draw() {
	// update timer based on host
	if (partyIsHost()) manageTimer();

	if (shared.gameState === "title") {
		drawTitleScreen();
	} else if (shared.gameState === "intro") {
		drawIntroScreen();
	} else if (shared.gameState === "playing") {
		drawGame();
		drawPlayers();
		checkPressedKeys();
		checkBoundaries();
		messages();
		nearClueLocation();
		playMusic();
		// checkMusic();
		checkFinalSolve();
		drawEnd();
	}

	if (shared.gameState === "title" && keyIsPressed === true) {
		shared.gameState = "intro";
	}
	if (shared.gameState === "intro" && mouseIsPressed) {
		shared.gameState = "playing";
	}
}

function drawTitleScreen() {
	background(startScreen);

	//brief instructions
	push();
	fill("#cccccc");
	strokeWeight(2);
	rect(120, 295, 410, 85, 5);
	fill("black");
	textSize(8);
	textAlign(CENTER);
	textLeading(12);
	text(
		"Escape with your team before time runs out! Explore the room using WASD or arrow keys. Unlock clues by interacting with items around you.",
		130,
		310,
		400,
		600
	);
	pop();

	//continue button
	push();
	fill("white");
	strokeWeight(2);
	rect(170, 440, 300, 38, 5);
	fill("black");
	textSize(9);
	textStyle(BOLD);
	text("-press any key to start-", 190, 455, 300, 600);
	pop();
}

function drawIntroScreen() {
	background(bgPortal);
	textFont("QuinqueFive");
	textAlign(CENTER);
	textSize(12);
	textLeading(25);
	fill("#000066");
	text("OMG?! We are being teleported!", 200, 165, 250, 350);
	fill("#000066");
	text("No way is this...where we had our first concert?", 200, 280, 250, 350);

	//continue button
	push();
	fill("white");
	strokeWeight(2);
	rect(170, 438, 300, 38, 10);
	fill("black");
	text("-click to continue-", 175, 450, 300, 600);
	pop();

	//game timer
	textSize(12);
	fill("white");
	text(shared.displayTime, 40, 620);
}

function drawGame() {
	//map image
	background(bg);

	//'press i for controls' message bottom left
	push();
	fill("white");
	textSize(8);
	textAlign(LEFT);
	text("hold 'i' for controls", 10, 570, 250, 600);
	if (clue1 === false) {
		text("'shift' for clue list", 2, 590, 250, 600);
	}
	pop();

	//game timer
	textSize(12);
	fill("white");
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
		image(characters[guest.characterId], guest.x, guest.y, 25, 35);
		// turn player left and right
		if (keyIsDown(LEFT_ARROW) || keyIsDown(65 /*a*/)) {
			image(charactersleft[guest.characterId], guest.x, guest.y, 25, 35);
		} else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68 /*d*/)) {
			image(characters[guest.characterId], guest.x, guest.y, 25, 35);
		}
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
	} else if (keyIsDown(73)) {
		//controls panel
		push();
		textAlign(LEFT);

		fill("white");
		strokeWeight(3);
		rect(145, 200, 320, 140, 10);

		fill("black");
		textStyle(BOLD);
		textFont("QuinqueFive");
		textSize(8);
		text("WASD or arrow keys to move", 165, 230);
		text("'E' to interact", 160, 270);
		text("'Ctrl' to reset position", 160, 310);
		pop();
	} else if (keyIsDown(SHIFT)) {
		// clue list
		if (
			clue1 === false &&
			clue2 === true &&
			clue3 === true &&
			clue4 === true &&
			clue5 === true
		) {
			push();
			strokeWeight(3);
			fill("white");
			rect(134, 350, 340, 120, 10);
			pop();

			push();
			fill("black");
			textSize(8);
			textLeading(12);
			textAlign(LEFT);
			text("Clue 1:", 150, 370, 300);
			text("The hands will tell you all you need to know.", 150, 390, 350);
			pop();
		} else if (
			clue1 === false &&
			clue2 === false &&
			clue3 === true &&
			clue4 === true &&
			clue5 === true
		) {
			push();
			strokeWeight(3);
			fill("white");
			rect(134, 350, 340, 150, 10);
			pop();

			push();
			fill("black");
			textSize(8);
			textLeading(12);
			textAlign(LEFT);
			text("Clue 1:", 150, 365, 300);
			text("The hands will tell you all you need to know.", 150, 385, 350);
			text("Clue 2:", 150, 420, 300);
			text(
				"The time is stuck at 4:30, 2 hours til showtime! Time to start practicing.",
				150,
				440,
				350
			);
			pop();
		} else if (
			clue1 === false &&
			clue2 === false &&
			clue3 === false &&
			clue4 === true &&
			clue5 === true
		) {
			push();
			strokeWeight(3);
			fill("white");
			rect(134, 300, 500, 200, 10);
			pop();

			push();
			fill("black");
			textSize(8);
			textLeading(12);
			textAlign(LEFT);
			text("Clue 1:", 150, 300, 300);
			text("The hands will tell you all you need to know.", 150, 385, 350);
			text("Clue 2:", 150, 320, 300);
			text(
				"The time is stuck at 4:30, 2 hours til showtime! Time to start practicing.",
				150,
				440,
				350
			);
			// must adjust so it fits in frame
			text("Clue 3:", 50, 450, 300);
			text(
				"It feels like something is missing on stage. Let's inspect the other instruments. At least the trumpet is in place.",
				150,
				500,
				330
			);
			pop();
		} else if (
			clue1 === false &&
			clue2 === false &&
			clue3 === false &&
			clue4 === false &&
			clue5 === true
		) {
			// must fill
		} else if (
			clue1 === false &&
			clue2 === false &&
			clue3 === false &&
			clue4 === false &&
			clue5 === false
		) {
			// must fill
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

function keyReleased() {
	if (playerLandmark === "piano") {
		nearClueForMusic = true;
	} else if (playerLandmark === "trumpet") {
		nearClueForMusic = true;
	} else if (playerLandmark === "guitar") {
		nearClueForMusic = true;
	}

	if (keyCode === 69 && nearClueForMusic) {
		musicPlayState = true;
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
		fill("white");
		rect(248, 580, 125, 30, 5);

		fill("black");
		textFont("QuinqueFive");
		textSize(8);
		text("It's locked!", 313, 598);
	}

	//starting clue
	if (shared.gameState === "playing" && clue1 === true) {
		push();
		strokeWeight(3);
		fill("white");
		rect(134, 350, 340, 120, 10);
		pop();

		push();
		fill("black");
		textSize(10);
		textLeading(20);
		text("Clue 1:", 50, 360, 300);
		text("The hands will tell you all you need to know.", 160, 390, 300);
		text("(Double click to close)", 160, 445, 300);
		pop();
	}

	//clock clue
	if (my.x > 30 && my.x < 110 && my.y < 75) {
		push();
		strokeWeight(3);
		fill("white");
		image(clockface, 210, 150, 180, 180);
		rect(134, 350, 340, 140, 10);
		pop();

		push();
		fill("black");
		textSize(9);
		textLeading(15);
		text("Clue 2:", 50, 360, 300);
		text(
			"The time is stuck at 4:30, 2 hours til showtime! This is usually when we would start rehearsing. I wonder if the piano is in tune.",
			145,
			390,
			330
		);
		text("(move away to close)", 160, 465, 300);
		pop();

		clue2 = false;
	}

	// piano clue
	if (playerLandmark === "piano" && keyIsDown(69)) {
		push();
		strokeWeight(3);
		fill("white");
		// image(clockface, 210, 150, 180, 180);
		rect(140, 350, 340, 120, 10);
		pop();

		push();
		fill("black");
		textSize(9);
		textLeading(15);
		text("Clue 3:", 50, 360, 300);
		text(
			"It feels like something is missing on stage. Let's inspect the other instruments. At least the trumpet is in place.",
			150,
			375,
			330
		);
		pop();

		clue3 = false;
	}

	// trumpet clue
	if (playerLandmark === "trumpet" && keyIsDown(69)) {
		push();
		strokeWeight(3);
		fill("white");
		// image(clockface, 210, 150, 180, 180);
		rect(140, 350, 340, 120, 10);
		pop();

		push();
		fill("black");
		textSize(9);
		textLeading(15);
		text("Clue 4:", 50, 360, 300);
		text(
			"The trumpet sounds fine, but there's still something missing from the stage. We need to find something red…",
			150,
			385,
			330
		);
		pop();

		clue4 = false;
	}

	// guitar clue
	if (playerLandmark === "guitar" && keyIsDown(69)) {
		push();
		strokeWeight(3);
		fill("white");
		// image(clockface, 210, 150, 180, 180);
		rect(140, 350, 340, 120, 10);
		pop();

		push();
		fill("black");
		textSize(9);
		textLeading(15);
		text("Clue 4:", 50, 360, 300);
		text(
			"Got the guitar! We should check the time again. I think it’s getting close to showtime. (Press ‘E’ to check the sound.)",
			150,
			378,
			330
		);
		pop();

		clue5 = false;
	}

	//final chessboard clue
	if (
		// shared.music1 === true &&
		// shared.music2 === true &&
		// shared.music3 === true &&
		my.x > 520 &&
		my.x < 620 &&
		my.y > 520 &&
		my.y < 620 &&
		keyIsDown(69)
	) {
		push();
		strokeWeight(3);
		fill("white");
		image(chess, 210, 140, 200, 200);
		rect(134, 350, 340, 120, 10);
		pop();

		push();
		fill("black");
		textSize(10);
		textLeading(15);
		text(
			"Why is the king at G5? Just like the pieces on a chessboard, everything on stage needs to be in its proper place for the performance to succeed.",
			145,
			365,
			330
		);
		pop();
	}

	shared.clue6 = true;
}

function doubleClicked() {
	if (clue1 === true) {
		clue1 = false;
	}
}

let playerLandmark = "none";
function nearClueLocation() {
	// play piano
	if (my.x > 220 && my.x < 360 && my.y < 100 && my.y > 0) {
		playerLandmark = "piano";
	}
	// near trumpet
	else if (my.x > 390 && my.x < 450 && my.y < 75 && my.y > 30) {
		playerLandmark = "trumpet";
	}
	// near guitar
	else if (my.x > 355 && my.x < 415 && my.y < 640 && my.y > 580) {
		playerLandmark = "guitar";
	} else {
		playerLandmark = "none";
	}
}

function playMusic() {
	// play piano
	if (playerLandmark === "piano" && musicPlayState) {
		console.log("played music");
		push();
		// fill(255, 251, 0, 30);
		// noStroke();
		// ellipse(304, 60, 110);
		pop();

		music1.play();
		musicPlayState = false;
		nearClueForMusic = false;
	}

	// play trumpet
	if (playerLandmark === "trumpet" && musicPlayState) {
		push();
		// fill(255, 251, 0, 50);
		// noStroke();
		// ellipse(430, 75, 40);
		pop();

		//shared.music2 = true;
		music2.play();
		musicPlayState = false;
		nearClueForMusic = false;
	}

	// play guitar
	if (playerLandmark === "guitar" && musicPlayState) {
		push();
		// fill(255, 251, 0, 50);
		// noStroke();
		// ellipse(390, 620, 40);
		pop();

		//shared.music3 = true;
		music3.play();
		musicPlayState = false;
		nearClueForMusic = false;
	}
}

// function checkMusic() {
// 	if (
// 		shared.music1 === true &&
// 		shared.music2 === true &&
// 		shared.music3 === true
// 	) {
// 		push();
// 		noStroke();
// 		fill(255, 251, 0, 50);
// 		ellipse(592, 585, 100);
// 		pop();
// 	}
// }

function checkFinalSolve() {
	if (
		shared.clue6 === true &&
		my.x > 320 &&
		my.x < 350 &&
		my.y > 350 &&
		my.y < 390 &&
		keyIsDown(69)
	) {
		shared.gameState = "win";
	}
}

function drawEnd() {
	if (shared.displayTime === "") {
		background(bgPortal);
		textFont("QuinqueFive");
		textAlign(CENTER);
		textSize(12);
		textLeading(25);
		fill("#000066");
		text(
			"Oh no! You failed to strike true harmony in time and now are stuck in the loop! CMD + R to refresh and try again.",
			200,
			215,
			250,
			350
		);
	} else if (shared.gameState === "win") {
		background(bgPortal);
		textFont("QuinqueFive");
		textAlign(CENTER);
		textSize(12);
		textLeading(25);
		fill("#000066");
		text(
			"We did it! We escaped in time and struck true harmony! CMD + R to play again.",
			200,
			245,
			250,
			350
		);
	}
}
