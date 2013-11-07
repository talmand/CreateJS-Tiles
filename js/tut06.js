/*jslint nomen: true, browser: true, devel: true, plusplus: true */
/*global Image, Audio, createjs */

var board;

(function () {

    'use strict';
    
    var $container, canvas, stage, canvasW, canvasH,
        manifest, totalLoaded, queue,
        map1, mapTiles, game, mapWidth, mapHeight, tileSheet, tiles,
        player, playerSheet, firstKey,
        enemy, enemySheet, enemies = [], randomTurn, directions = [0, 90, 180, 270],
        keysPressed = {
            38: 0,
            40: 0,
            37: 0,
            39: 0
        };
    
    $container = document.getElementById("container");
    canvasW = 384;
    canvasH = 288;
    
    map1 = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    mapTiles = {};
    
    function buildMap(map) {
        
        var row, col, tileClone, tileIndex, defineTile;
        
        if (!board) {
            board = new createjs.Container();
            board.x = 0;
            board.y = 0;
            stage.addChild(board);
        }
        
        mapWidth = map[0].length;
        mapHeight = map.length;
        
        defineTile = {
            walkable: function (row, col) {
                if (map[row][col] === 0) {
                    return false;
                } else {
                    return true;
                }
            },
            door: function (row, col) {
                if (map[row][col] === 2) {
                    return true;
                } else {
                    return false;
                }
            }
        };
        
        tileIndex = 0;
        mapTiles = [];
        board.removeAllChildren();
        for (row = 0; row < mapHeight; row++) {
            for (col = 0; col < mapWidth; col++) {
                tileClone = tiles.clone();
                tileClone.name = "t_" + row + "_" + col;
                tileClone.gotoAndStop(map[row][col]);
                tileClone.x = col * tileSheet._frameWidth;
                tileClone.y = row * tileSheet._frameHeight;
                mapTiles["t_" + row + "_" + col] = {
                    index: tileIndex,
                    walkable: defineTile.walkable(row, col),
                    door: defineTile.door(row, col)
                };
                tileIndex++;
                board.addChild(tileClone);
            }
        }
        
    }
    
    function addPlayer(rot) {
        player.name = "player";
        player.x = canvasW / 2;
        player.y = canvasH / 2;
        player.regX = 0;
        player.regY = 0;
        player.rotation = rot;
        player.speed = 6;
        player.height = 34;
        player.width = 34;
        player.gotoAndStop("stand");
        board.addChild(player);
    }
    
    function addEnemy(x, y, rot) {
        var num = enemies.length;
        enemies[num] = enemy.clone();
        enemies[num].name = "enemy" + enemies.length;
        enemies[num].x = x * tileSheet._frameWidth + (tileSheet._frameWidth / 2);
        enemies[num].y = y * tileSheet._frameHeight + (tileSheet._frameHeight / 2);
        enemies[num].regX = 0;
        enemies[num].regY = 0;
        enemies[num].rotation = rot;
        enemies[num].speed = 2;
        enemies[num].height = 34;
        enemies[num].width = 34;
        enemies[num].gotoAndPlay("walk");
        board.addChild(enemies[num]);
    }
    
    function warpChar(char, x, y, rot) {
        
        char.x = x * tileSheet._frameWidth + (tileSheet._frameWidth / 2);
        char.y = y * tileSheet._frameHeight + (tileSheet._frameHeight / 2);
        char.rotation = rot;
        
    }
    
    function checkCorners(char, dirx, diry) {
        
        var formulaA, formulaB, formulaC, formulaD;
        
        if (dirx === 0) {
            formulaC = Math.floor((char.x - char.width / 2) / tileSheet._frameWidth);
            formulaD = Math.floor((char.x + char.width / 2) / tileSheet._frameWidth);
            if (diry === -1) { // up
                formulaA = Math.floor(((char.y - char.width / 2) + (char.speed * diry)) / tileSheet._frameHeight);
                char.topLeft = mapTiles["t_" + formulaA + "_" + formulaC];
                char.topRight = mapTiles["t_" + formulaA + "_" + formulaD];
                if (char.topLeft.walkable && char.topRight.walkable) {
                    return true;
                }
            } else if (diry === 1) { // down
                formulaB = Math.floor(((char.y + char.width / 2) + (char.speed * diry)) / tileSheet._frameHeight);
                char.bottomLeft = mapTiles["t_" + formulaB + "_" + formulaC];
                char.bottomRight = mapTiles["t_" + formulaB + "_" + formulaD];
                if (char.bottomLeft.walkable && char.bottomRight.walkable) {
                    return true;
                }
            }
        }
        if (diry === 0) {
            formulaC = Math.floor((char.y - char.height / 2) / tileSheet._frameHeight);
            formulaD = Math.floor((char.y + char.height / 2) / tileSheet._frameHeight);
            if (dirx === -1) { // left
                formulaA = Math.floor(((char.x - char.width / 2) + (char.speed * dirx)) / tileSheet._frameWidth);
                char.topLeft = mapTiles["t_" + formulaC + "_" + formulaA];
                char.bottomLeft = mapTiles["t_" + formulaD + "_" + formulaA];
                if (char.topLeft.walkable && char.bottomLeft.walkable) {
                    return true;
                }
            } else if (dirx === 1) { // right
                formulaB = Math.floor(((char.x + char.width / 2) + (char.speed * dirx)) / tileSheet._frameWidth);
                char.topRight = mapTiles["t_" + formulaC + "_" + formulaB];
                char.bottomRight = mapTiles["t_" + formulaD + "_" + formulaB];
                if (char.topRight.walkable && char.bottomRight.walkable) {
                    return true;
                }
            }
        }
        
    }
    
    function moveChar(char, dirx, diry) {
        
        if (dirx === 0) {
            if (diry === -1 && checkCorners(char, dirx, diry)) { // up
                if (char.name === "player") {
                    board.y += -diry * char.speed;
                }
                char.y += diry * char.speed;
                char.rotation = 270;
            } else if (diry === 1 && checkCorners(char, dirx, diry)) { // down
                if (char.name === "player") {
                    board.y += -diry * char.speed;
                }
                char.y += diry * char.speed;
                char.rotation = 90;
            }
        }
        if (diry === 0) {
            if (dirx === -1 && checkCorners(char, dirx, diry)) { // left
                if (char.name === "player") {
                    board.x += -dirx * char.speed;
                }
                char.x += dirx * char.speed;
                char.rotation = 180;
            } else if (dirx === 1 && checkCorners(char, dirx, diry)) { // right
                if (char.name === "player") {
                    board.x += -dirx * char.speed;
                }
                char.x += dirx * char.speed;
                char.rotation = 0;
            }
        }
        
    }
    
    function pTheorem(point1, point2) {
        return Math.floor(Math.sqrt(((point2.x - point1.x) * (point2.x - point1.x)) + ((point2.y - point1.y) * (point2.y - point1.y))));
    }
    
    function getAngle(point1, point2) {
        
        var deltaX, deltaY, angle;
        
        deltaX = point2.x - point1.x;
        deltaY = point2.y - point1.y;
        
        angle = Math.atan2(deltaY, deltaX);
        
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        
        return angle * 180 / Math.PI;
        
    }
    
    function enemyBrain() {
        
        var e, distToPlayer, angleToPlayer;
        
        function walkForward() {
            if (enemies[e].currentAnimation !== "walk") {
                enemies[e].gotoAndPlay("walk");
            }
            switch (enemies[e].rotation) {
            case 0:
                if (checkCorners(enemies[e], 1, 0)) {
                    moveChar(enemies[e], 1, 0);
                } else {
                    enemies[e].rotation = directions[Math.floor(Math.random() * directions.length)];
                }
                break;
            case 90:
                if (checkCorners(enemies[e], 0, 1)) {
                    moveChar(enemies[e], 0, 1);
                } else {
                    enemies[e].rotation = directions[Math.floor(Math.random() * directions.length)];
                }
                break;
            case 180:
                if (checkCorners(enemies[e], -1, 0)) {
                    moveChar(enemies[e], -1, 0);
                } else {
                    enemies[e].rotation = directions[Math.floor(Math.random() * directions.length)];

                }
                break;
            case 270:
                if (checkCorners(enemies[e], 0, -1)) {
                    moveChar(enemies[e], 0, -1);
                } else {
                    enemies[e].rotation = directions[Math.floor(Math.random() * directions.length)];
                }
                break;
            default:
                enemies[e].rotation = 0;
            }
        }
        
        for (e = 0; e < enemies.length; e++) {
            
            distToPlayer = pTheorem({x: enemies[e].x, y: enemies[e].y}, {x: player.x, y: player.y});
            angleToPlayer = Math.floor(getAngle({x: enemies[e].x, y: enemies[e].y}, {x: player.x, y: player.y}));
            if (distToPlayer < player.width * 3) {
                //enemies[e].gotoAndStop("stand");
                if (angleToPlayer > 315 || angleToPlayer < 45) {
                    enemies[e].rotation = 0;
                }
                if (angleToPlayer > 45 && angleToPlayer < 135) {
                    enemies[e].rotation = 90;
                }
                if (angleToPlayer > 135 && angleToPlayer < 225) {
                    enemies[e].rotation = 180;
                }
                if (angleToPlayer > 225 && angleToPlayer < 315) {
                    enemies[e].rotation = 270;
                }
                if (distToPlayer > player.width) {
                    walkForward();
                } else {
                    enemies[e].gotoAndStop("stand");
                }
            } else {
                if (randomTurn) {
                    enemies[e].rotation = directions[Math.floor(Math.random() * directions.length)];
                    randomTurn = false;
                }
                walkForward();
            }
            
        }
        
    }
    
    document.addEventListener("keydown", function (e) {
        keysPressed[e.keyCode] = 1;
        if (!firstKey) { firstKey = e.keyCode; }
    });
    document.addEventListener("keyup", function (e) {
        keysPressed[e.keyCode] = 0;
        if (firstKey === e.keyCode) { firstKey = null; }
        if (player) { player.gotoAndStop("stand"); }
    });
    function detectKeys() {
        
        if (keysPressed[38] === 1) { // up
            if (player.currentAnimation !== "walk") { player.gotoAndPlay("walk"); }
            moveChar(player, 0, -1);
        }
        if (keysPressed[40] === 1) { // down
            if (player.currentAnimation !== "walk") { player.gotoAndPlay("walk"); }
            moveChar(player, 0, 1);
        }
        if (keysPressed[37] === 1) { // left
            if (player.currentAnimation !== "walk") { player.gotoAndPlay("walk"); }
            moveChar(player, -1, 0);
        }
        if (keysPressed[39] === 1) { // right
            if (player.currentAnimation !== "walk") { player.gotoAndPlay("walk"); }
            moveChar(player, 1, 0);
        }
        
        // firstKey marks the dominant key which forces rotation that direction
        // examples:
        // if up is firstKey then pressing right at same time will cause strafe right
        // if right is firstKey then pressing up at same time will cause strafe up
        if (firstKey) {
            switch (firstKey) {
            case 38:
                player.rotation = 270;
                break;
            case 40:
                player.rotation = 90;
                break;
            case 37:
                player.rotation = 180;
                break;
            case 39:
                player.rotation = 0;
                break;
            }
        }
        
    }
    
    function lightTiles() {
        
        var item, distToPlayer;
        
        if (board) {
            for (item = 0; item < board.children.length; item++) {
                board.children[item].alpha = 0;
                distToPlayer = pTheorem({x: board.children[item].x, y: board.children[item].y}, {x: player.x, y: player.y});
                board.children[item].alpha = 100 / distToPlayer - 0.6;
            }
        }
        
    }
    
    function handleTick() {
        
        detectKeys();
        enemyBrain();
        lightTiles();
        stage.update();
    
    }
    
    function init() {
        
        var randomTurnTimer = setInterval(function () {
            randomTurn = true;
        }, 5000);
        
        manifest = [
            {src: "images/tiles.png", id: "tiles"},
            {src: "images/player.png", id: "player"}
        ];
        totalLoaded = 0;
        
        function handleLoadComplete(event) {
            totalLoaded++;
//            if (totalLoaded < manifest.length) {
//                console.log(totalLoaded + "/" + manifest.length + " loaded");
//            }
        }
        
        function handleFileLoad(event) {
            var img, audio;
            if (event.item.type === "image") {
                img = new Image();
                img.src = event.item.src;
                img.onload = handleLoadComplete;
            } else if (event.item.type === "sound") {
                audio = new Audio();
                audio.src = event.item.src;
                audio.onload = handleLoadComplete;
            }
        }
        
        function handleComplete(event) {
            stage.currentMap = "map1";
            buildMap(map1);
            addPlayer(0);
            addEnemy(1, 1, 0);
            addEnemy(6, 4, 0);
            addEnemy(10, 5, 0);
        }
        
        queue = new createjs.LoadQueue(false);
        queue.installPlugin(createjs.SoundJS);
        queue.addEventListener("fileload", handleFileLoad);
        queue.addEventListener("complete", handleComplete);
        queue.loadManifest(manifest);
        
        canvas = document.getElementById("canvas");
        stage = new createjs.Stage(canvas);
        stage.enableMouseOver(30);
        createjs.Touch.enable(stage);
        createjs.Ticker.setFPS(30);
        createjs.Ticker.useRAF = true;
        createjs.Ticker.addEventListener("tick", handleTick);
        
        // animation frames are not required
        tileSheet = new createjs.SpriteSheet({
            images: ["images/tiles.png"],
            frames: {
                height: 48,
                width: 48,
                regX: 0,
                regY: 0,
                count: 3
            }
        });
        
        tiles = new createjs.BitmapAnimation(tileSheet);
        
        playerSheet = new createjs.SpriteSheet({
            animations: {
                stand: [0],
                walk: [1, 4]
            },
            images: ["images/player.png"],
            frames: {
                height: 48,
                width: 48,
                regX: 24,
                regY: 24,
                count: 5
            }
        });
        
        player = new createjs.BitmapAnimation(playerSheet);
        
        enemySheet = new createjs.SpriteSheet({
            animations: {
                stand: [0],
                walk: [1, 4]
            },
            images: ["images/enemy.png"],
            frames: {
                height: 48,
                width: 48,
                regX: 24,
                regY: 24,
                count: 5
            }
        });
        
        enemy = new createjs.BitmapAnimation(enemySheet);
        
    }
    init();
                
    function resize() {
        
        var windowWidth = window.innerWidth,
            windowHeight = window.innerHeight,
            scaleToFitX = windowWidth / canvasW,
            scaleToFitY = windowHeight / canvasH,
            currentScreenRatio = windowWidth / windowHeight,
            optimalRatio = Math.min(scaleToFitX, scaleToFitY);
        if (currentScreenRatio >= 1.77 && currentScreenRatio <= 1.79) {
            $container.style.width = windowWidth + "px";
            $container.style.height = windowHeight + "px";
        } else {
            $container.style.width = canvasW * optimalRatio + "px";
            $container.style.height = canvasH * optimalRatio + "px";
        }
        
    }
    resize();
    window.addEventListener("resize", resize);
    
}());