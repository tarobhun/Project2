// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 1000;
document.body.appendChild(canvas);

// lots of variables to keep track of sprite geometry
//  I have 8 rows and 3 cols in my space ship sprite sheet
var rows = 4;
var cols = 5;

//second row for the right movement (counting the index from 0)
var trackRight = 2;
//third row for the left movement (counting the index from 0)
var trackLeft = 1;
var trackUp = 3;   // not using up and down in this version, see next version
var trackDown = 0;

var spriteWidth = 400; // also  spriteWidth/cols; 
var spriteHeight = 320;  // also spriteHeight/rows; 
var width = spriteWidth / cols; 
var height = spriteHeight / rows; 

var curXFrame = 0; // start on left side
var frameCount = 3;  // 3 frames per row
//x and y coordinates of the overall sprite image to get the single frame  we want
var srcX = 0;  // our image has no borders or other stuff
var srcY = 0;

//Assuming that at start the character will move right side 
var left = false;
var right = false;
var up = false;
var down = false;


// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
    bgReady = true;
};
bgImage.src = "images/grassBG.jpg";

// Edge image
var edgeReady = false;
var edgeImage = new Image();
edgeImage.onload = function () {
    edgeReady = true;
};
edgeImage.src = "images/edges.png";

// Edge image LEFT
var edgeReadyLeft = false;
var edgeImageLeft = new Image();
edgeImageLeft.onload = function () {
    edgeReadyLeft = true;
};
edgeImageLeft.src = "images/edgesLeft.png";

// Edge image RIGHT
var edgeReadyRight = false;
var edgeImageRight = new Image();
edgeImageRight.onload = function () {
    edgeReadyRight = true;
};
edgeImageRight.src = "images/edgesRight.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
    heroReady = true;
};
heroImage.src = "images/sheet.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
    monsterReady = true;
};
monsterImage.src = "images/monster.png";

// Hole image
var holeReady = false;
var holeImage = new Image();
holeImage.onload = function () {
    holeReady = true;
};
holeImage.src = "images/hole.png";

//=========done creating image objects ============

var soundgameover = "sounds/gameover.wav"; //game over sound efx
var soundCaught = "sounds/neigh.wav"; //caught a horse sound efx
var soundLost = "sounds/lost.wav"; //fell into a hole sound efx
//Assign audio to soundEfx
var soundEfx = document.getElementById("soundEfx");
// =============end of sound loading==============

// Game objects
var hero = {
    speed: 256, // movement in pixels per second
    x: 0,  // where on the canvas are they?
    y: 0  // where on the canvas are they?
};
var monster = {
// for this version, the monster does not move, so just and x and y
    x: 0,
    y: 0
};
var monstersCaught = 0;

var hole = {
    x: 0,  // where on the canvas are they?
    y: 0  // where on the canvas are they?
};
var hole2 = {
    x: 0,  // where on the canvas are they?
    y: 0  // where on the canvas are they?
};
var hole3 = {
    x: 0,  // where on the canvas are they?
    y: 0  // where on the canvas are they?
};
var monstersCaught = 0;
let died = false;

// ============done with other variables==================

// Handle keyboard controls
var keysDown = {}; //object were we properties when keys go down
                // and then delete them when the key goes up
// so the object tells us if any key is down when that keycode
// is down.  In our game loop, we will move the hero image if when
// we go thru render, a key is down

addEventListener("keydown", function (e) {
    console.log(e.keyCode + " down")
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    console.log(e.keyCode + " up")
    delete keysDown[e.keyCode];
}, false);

// Add a flag to check if the game has been won
var gameWon = false;

// Update game objects
var update = function (modifier) {
    left = false;
    right = false;
    up = false;
    down = false;

    if (38 in keysDown && hero.y > 32 + 0) { // holding up key
        hero.y -= hero.speed * modifier;
        up = true; // for animation
    }
    if (40 in keysDown && hero.y < canvas.height - (96 + 0)) { // holding down key
        hero.y += hero.speed * modifier;
        down = true; //for animation
    }
    if (37 in keysDown && hero.x > (32 + 4)) { // holding left key
        hero.x -= hero.speed * modifier;
        left = true;   // for animation
    }
    if (39 in keysDown && hero.x < canvas.width - (96 + 0)) { // holding right key
        hero.x += hero.speed * modifier;
        right = true; // for animation
    }

    curXFrame = ++curXFrame % frameCount; 	//Updating the sprite frame index 
    // it will count 0,1,2,0,1,2,0, etc
    srcX = curXFrame * width;   	//Calculating the x coordinate for spritesheet 
    //if left is true,  pick Y dim of the correct row
    if (left) {
        //calculate srcY 
        srcY = trackLeft * height;
    }

    //if the right is true,   pick Y dim of the correct row
    if (right) {
        //calculating y coordinate for spritesheet
        srcY = trackRight * height;
    }

    if (left == false && right == false && up == false && down == false) {
        srcX = 1 * width;
        srcY = 0 * height;
    }
    if (up) {
        //calculate srcY 
        srcY = trackUp * height;
    }
    if (down) {
        //calculate srcY 
        srcY = trackDown * height;
    }
    

    // Are they touching the monster?
    if (
        hero.x <= (monster.x + 32)
        && monster.x <= (hero.x + 32)
        && hero.y <= (monster.y + 32)
        && monster.y <= (hero.y + 32)
    ) {
        ++monstersCaught; // keep track of our “score”
        if (monstersCaught % 5 === 0 && !gameWon) { // Check if 5 monsters have been caught and the game hasn't been won
            soundEfx.addEventListener("ended", function () {
                alert("YOU WON!! GAME OVER.");
                gameWon = true; // Set gameWon to true after displaying the alert
                resetGame(); // Reset the game
            });
            soundEfx.src = soundgameover;
            soundEfx.play();
        } else {
            soundEfx.src = soundCaught;
            soundEfx.play();
        }
        reset(); // start a new cycle
        placeHoles(); // place new holes
    }
     // Check if hero collides with a hole
     if (
        (hero.x <= (hole.x + 32)
        && hole.x <= (hero.x + 32)
        && hero.y <= (hole.y + 32)
        && hole.y <= (hero.y + 32)) ||
        (hero.x <= (hole2.x + 32)
        && hole2.x <= (hero.x + 32)
        && hero.y <= (hole2.y + 32)
        && hole2.y <= (hero.y + 32)) ||
        (hero.x <= (hole3.x + 32)
        && hole3.x <= (hero.x + 32)
        && hero.y <= (hole3.y + 32)
        && hole3.y <= (hero.y + 32))
    ) {
        // Play game over sound
        soundEfx.src = soundLost;
        soundEfx.play();
        // Display game over message
        alert("You fell into a hole and broke your ankle. GAME OVER");
        // Reset the game
        resetGame();
        }
};

// Function to reset the game
var resetGame = function () {
    reset();
    monstersCaught = 0;
    location.reload(); // Refresh the page
};

// Draw everything in the main render function
var render = function () {
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0); // upper x, upper y coordinates
    }
    if (edgeReady) {
        ctx.drawImage(edgeImage, 0, 0); // upper x, upper y coordinates
        ctx.drawImage(edgeImage, 0, 968); // bottom x, bottom y coordinates
    }
    if (edgeReadyLeft) {
        ctx.drawImage(edgeImageLeft, 0, 0); 
    }
    if (edgeReadyRight) {
        ctx.drawImage(edgeImageRight, 968, 0);
    }
    if (heroReady) {
        //ctx.drawImage(heroImage, hero.x, hero.y);
         ctx.drawImage(heroImage, srcX, srcY, width, height, hero.x, hero.y, width, height);
    }

    if (monsterReady) {
        ctx.drawImage(monsterImage, monster.x, monster.y);
    }
    // Drawing holes
    if (holeReady) {
        ctx.drawImage(holeImage, hole.x, hole.y);
    }
    if (holeReady) {
        ctx.drawImage(holeImage, hole2.x, hole2.y);
    }
    if (holeReady) {
        ctx.drawImage(holeImage, hole3.x, hole3.y);
    }
    // Score
    ctx.fillStyle = "rgb(250, 250, 250)";
    ctx.font = "24px Helvetica";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Horses caught: " + monstersCaught, 32, 32);


}

// The main game loop
var main = function () {
    var now = Date.now();
    var delta = now - then;
    update(delta / 1000);
    render();
    then = now;
    //  Request to do this again ASAP
    requestAnimationFrame(main);
};


// Reset the game when the player catches a monster
var reset = function () {
    hero.x = (canvas.width / 2) - 16;
    hero.y = (canvas.height / 2) - 16;

//Place the monster somewhere on the screen randomly
// but not in the hedges, Article in wrong, the 64 needs to be 
// hedge 32 + hedge 32 + char 32 = 96
do {
    monster.x = 32 + (Math.random() * (canvas.width - 96));
    monster.y = 32 + (Math.random() * (canvas.height - 116)); // Adjusted to be an additional 10px away from the bottom edge
} while (isTooClose(monster, hero, 50) || isTooClose(monster, hole, 50) || isTooClose(monster, hole2, 50) || isTooClose(monster, hole3, 50));
    placeHoles();
};

// Function to check if two objects are too close
var isTooClose = function (obj1, obj2, minDistance) {
    var dx = obj1.x - obj2.x;
    var dy = obj1.y - obj2.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance < minDistance;
};

// Function to place holes randomly
var placeHoles = function () {
    do {
        hole.x = 10 + (Math.random() * (canvas.width - 116)); // Adjusted to be 10px away from the left edge and 106px away from the right edge
        hole.y = 10 + (Math.random() * (canvas.height - 116)); // Adjusted to be 10px away from the top edge and 106px away from the bottom edge
    } while (isTooClose(hole, hero, 50) || isTooClose(hole, monster, 50)); // Adjust the third parameter as needed

    do {
        hole2.x = 10 + (Math.random() * (canvas.width - 116));
        hole2.y = 10 + (Math.random() * (canvas.height - 116));
    } while (isTooClose(hole2, hero, 50) || isTooClose(hole2, monster, 50)); // Adjust the third parameter as needed

    do {
        hole3.x = 10 + (Math.random() * (canvas.width - 116));
        hole3.y = 10 + (Math.random() * (canvas.height - 116));
    } while (isTooClose(hole3, hero, 50) || isTooClose(hole3, monster, 50)); // Adjust the third parameter as needed
};


// Let's play this game!
var then = Date.now();
reset();
main();  // call the main game loop.
