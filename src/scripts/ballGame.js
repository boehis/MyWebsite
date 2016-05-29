"use strict";

var gameRunning = false;
var canvas;
var ctx;
function playBallGame(scrollTop) {
    var canvasElement = $('#canvas');
    var divBottom = canvasElement.offset().top + canvasElement.height();
    if ((scrollTop + window.innerHeight >= divBottom) &&
        scrollTop < divBottom) {
        if (gameRunning == false) {
            gameRunning = true;
            initBallGame();
            update();
        }
    } else {
        stopGame();
    }
    updateCanvasRect();
}

var balls = [];

function initBallGame() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");
    var about = $('#about');
    canvas.width = about.outerWidth();
    canvas.height = about.outerHeight();

    about= document.getElementById('about');
    about.addEventListener('mousedown', mouseDown, false);
    about.addEventListener('mouseup', mouseUp, false);
    about.addEventListener('mousemove', mouseMove, false);
    about.addEventListener('mouseleave', mouseLeave, false);
    about.addEventListener('contextmenu', handleContextMenu, false);

    window.addEventListener('scroll', updateCanvasRect, false);

    if (balls.length == 0) {
        balls.push(new Ball(25,-1));
        balls.push(new Ball(20,-1));
    }

    $('#addBallButton').click(addBall);
}

function stopGame() {
    gameRunning = false;
    if (ctx) {
        clearCanvas();
    }
    hideContextMenu();
}

function Ball(radius, color, x, y) {
    this.construct(radius, color, x, y);
}
Ball.prototype = {
    construct: function (radius, color, x, y) {
        this.x = x || Math.floor(Math.random() * (canvas.width-radius))+radius;
        this.y = y || -50;

        this.radius = radius;
        if(radius > 50 || radius < 4){
            this.radius = Math.floor(Math.random() * 46) + 4;
        }else {
            this.radius = radius;
        }
        if(color > 360 || color < 0){
            this.color = Math.floor(Math.random() * 360);
        }else {
            this.color = color;
        }

        this.vx = 0;
        this.vy = 1;

        this.gravity = 0.2;
        this.airFriction = calculateAirFriction(radius);
        this.bounceFactor = calculateBounceFactor(radius);

    },
    draw: function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = "hsl("+this.color+", 100%, 40%)";
        ctx.fill();
        ctx.closePath();
    },
    isInElement: function (mouse) {
        var res = Math.sqrt((mouse.x - this.x) * (mouse.x - this.x) + (mouse.y - this.y) * (mouse.y - this.y));
        return res < this.radius;
    }
};

function calculateBounceFactor(radius) {
    //Todo: Formula , linear function (q = 0.2)
    return radius/50  +0.2;
}
function calculateAirFriction(radius, ground) {
    if (ground) return 1 - 1 / 8;
    return 1 - radius / 800;
}
function clearCanvas() {
    ctx.fillStyle = "rgba(255,255,255,0.1";
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.globalCompositeOperation = "source-over";
}

var tempVX = 0;
function update() {
    if (!gameRunning) return;
    requestAnimationFrame(update);

    clearCanvas();
    for (var i = 0; i < balls.length; i++) {
        updateBallPos(balls[i]);
    }

}
function updateBallPos(ball)    {
    var collidingBall = detectCollision(ball);
    if (collidingBall) {
        calculateCollision(ball, collidingBall)
    }

    ball.y += ball.vy;

    ball.vy += ball.gravity;
    ball.x += ball.vx;

    ball.vx *= ball.airFriction;
    ball.vy *= ball.airFriction;
    if (ball.y > canvas.height - ball.radius - 1 && ball.vy < 1.5 && ball.vy > -1.5) {
        ball.y = canvas.height - ball.radius;
        ball.vy = 0;
        ball.airFriction = calculateAirFriction(ball.radius, true);
    } else {
        ball.airFriction = calculateAirFriction(ball.radius);
    }
    if (tempVX - ball.vx < 0.1 && ball.vx - tempVX < 0.1) {
        ball.vx = 0;
    }

    if (ball.y - ball.radius <= 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy;
    } else if (ball.y + ball.radius >= canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy *= -ball.bounceFactor;
        ball.vy += 0.1
    }

    if (ball.x - ball.radius <= 0) {
        ball.x = ball.radius;
        ball.vx = -ball.vx;
    } else if (ball.x + ball.radius >= canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx = -ball.vx;
    }

    ball.draw();
}

function detectCollision(ball) {
    var index = balls.indexOf(ball);
    for (var i = 0; i < balls.length; i++) {
        if (i != index) {
            var otherBall = balls[i];
            var distance = (ball.x - otherBall.x) * (ball.x - otherBall.x) + (ball.y - otherBall.y) * (ball.y - otherBall.y);
            var minDistance = (ball.radius + otherBall.radius) * (ball.radius + otherBall.radius);
            if (distance <= minDistance) {
                return otherBall;
            }
        }
    }
}

function calculateCollision(ball1, ball2) {
    var speed1 = Math.sqrt(ball1.vx * ball1.vx + ball1.vy * ball1.vy);
    var speed2 = Math.sqrt(ball2.vx * ball2.vx + ball2.vy * ball2.vy);

    ball1.vx = ball1.x - ball2.x;
    ball1.vy = ball1.y - ball2.y;

    ball2.vx = ball2.x - ball1.x;
    ball2.vy = ball2.y - ball1.y;

    var newSpeed1 = Math.sqrt(ball1.vx * ball1.vx + ball1.vy * ball1.vy);
    var newSpeed2 = Math.sqrt(ball2.vx * ball2.vx + ball2.vy * ball2.vy);


    ball1.vx = ball1.vx * (speed1 / newSpeed1);
    ball1.vy = ball1.vy * (speed1 / newSpeed1);

    ball2.vx = ball2.vx * (speed2 / newSpeed2);
    ball2.vy = ball2.vy * (speed2 / newSpeed2);

}


var drag = false;
var mousePos = {
    x: 0,
    y: 0
};

var dragElement;
function onDragStart() {
    dragElement.vx = (mousePos.x - dragElement.x) / 10;
    dragElement.vy = (mousePos.y - dragElement.y) / 10;
}

function onDragUpdated() {
    dragElement.vx = (mousePos.x - dragElement.x) / 10;

    dragElement.vy = (mousePos.y - dragElement.y) / 10;
}

function onDragEnded() {
}

function onDragCancelled() {
}


var canvasRect;
function getMousePos(evt) {
    mousePos.x = evt.clientX - canvasRect.left;
    mousePos.y = evt.clientY - canvasRect.top;
}

function updateCanvasRect() {
    if (canvas) {
        canvasRect = canvas.getBoundingClientRect();
    }
}

function mouseDown(evt) {
    getMousePos(evt);
    for (var i = 0; i < balls.length; i++) {
        if (balls[i].isInElement(mousePos)) {
            dragElement = balls[i];
            drag = true;
            onDragStart();
            break;
        }
    }
    hideContextMenu();
}

function mouseUp(evt) {
    getMousePos(evt);
    if (drag) {
        onDragEnded();
    }
    drag = false;
}

function mouseMove(evt) {
    getMousePos(evt);
    if (drag) {
        onDragUpdated();
    }
}

function mouseLeave(evt) {
    getMousePos(evt);
    if (drag) {
        onDragCancelled();
        drag = false;
    }
}

function handleContextMenu(e) {
    var found = false;
    getMousePos(e);
    for (var i = 0; i < balls.length; i++) {
        var ball = balls[i];
        if (ball.isInElement(mousePos)) {
            var index = balls.indexOf(ball);
            balls.splice(index, 1);
            found = true;
            break;
        }
    }
    if (!found) {
        $('#canvas-context-menu').css({
            top: mousePos.y + canvasRect.top,
            left: mousePos.x + canvasRect.left,
            display: 'block'
        });
        $('.inputField').keypress(function (e) {
            if (e.which == 13) {
                addBall();
            }
        });
    }

    // prevents the usual context from popping up
    e.preventDefault();
    return (false);
}
var doubleclick = false;
function addBall() {
    if(!doubleclick){
        doubleclick=true;
        var color = parseInt(document.getElementById('colorInput').value);
        var size = parseInt(document.getElementById('sizeInput').value);
        if (color != '' && size != 0) {
            balls.push(new Ball(size, color));
        }
        hideContextMenu();
        doubleclick=false;
    }
}
function hideContextMenu() {
    $('#canvas-context-menu').css({
        display: 'none'
    });
}