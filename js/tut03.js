/*jslint nomen: true, browser: true, devel: true, plusplus: true */
/*global Image, Audio, createjs */

(function () {

    'use strict';
    
    var $container, canvas, stage, canvasW, canvasH,
        manifest, totalLoaded, queue,
        map1, map2, mapTiles, game, mapWidth, mapHeight, tileSheet, tiles, board,
        player, playerSheet, firstKey,
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
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 2],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    map2 = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [2, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
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
    
    function addPlayer(x, y, rot) {
        
        player.name = "player";
        player.x = x * tileSheet._frameWidth + (tileSheet._frameWidth / 2);
        player.y = y * tileSheet._frameHeight + (tileSheet._frameHeight / 2);
        player.regX = 0;
        player.regY = 0;
        player.rotation = rot;
        player.speed = 6;
        player.height = 34;
        player.width = 34;
        player.gotoAndStop("stand");
        board.addChild(player);
        
    }
    
    function warpChar(char, x, y, rot) {
        
        if (char.name === "player") {
            board.addChild(player);
        }
        
        char.x = x * tileSheet._frameWidth + (tileSheet._frameWidth / 2);
        char.y = y * tileSheet._frameHeight + (tileSheet._frameHeight / 2);
        char.rotation = rot;
        
    }
    
    function moveChar(char, dirx, diry) {
        
        var formulaA, formulaB, formulaC, formulaD, delay;
        
        if (dirx === 0) {
            formulaC = Math.floor((char.x - char.width / 2) / tileSheet._frameWidth);
            formulaD = Math.floor((char.x + char.width / 2) / tileSheet._frameWidth);
            if (diry === -1) { // up
                formulaA = Math.floor(((char.y - char.height / 2) + (char.speed * diry)) / tileSheet._frameHeight);
                char.topLeft = mapTiles["t_" + formulaA + "_" + formulaC];
                char.topRight = mapTiles["t_" + formulaA + "_" + formulaD];
                char.rotation = 270;
                if (char.topLeft.walkable && char.topRight.walkable) {
                    char.y += diry * char.speed;
                }
            } else if (diry === 1) { // down
                formulaB = Math.floor(((char.y + char.height / 2) + (char.speed * diry)) / tileSheet._frameHeight);
                char.bottomLeft = mapTiles["t_" + formulaB + "_" + formulaC];
                char.bottomRight = mapTiles["t_" + formulaB + "_" + formulaD];
                char.rotation = 90;
                if (char.bottomLeft.walkable && char.bottomRight.walkable) {
                    char.y += diry * char.speed;
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
                char.rotation = 180;
                if (char.topLeft.walkable && char.bottomLeft.walkable) {
                    char.x += dirx * char.speed;
                }
                if (char.topLeft.door && char.bottomLeft.door) {
                    if (stage.currentMap === "map2") {
                        delay = window.setTimeout(function () {
                            buildMap(map1);
                            warpChar(player, 6, 4, 180);
                            stage.currentMap = "map1";
                        }, 200);
                    }
                }
            } else if (dirx === 1) { // right
                formulaB = Math.floor(((char.x + char.width / 2) + (char.speed * dirx)) / tileSheet._frameWidth);
                char.topRight = mapTiles["t_" + formulaC + "_" + formulaB];
                char.bottomRight = mapTiles["t_" + formulaD + "_" + formulaB];
                char.rotation = 0;
                if (char.topRight.walkable && char.bottomRight.walkable) {
                    char.x += dirx * char.speed;
                }
                if (char.topRight.door && char.bottomRight.door) {
                    if (stage.currentMap === "map1") {
                        delay = window.setTimeout(function () {
                            buildMap(map2);
                            warpChar(player, 1, 4, 0);
                            stage.currentMap = "map2";
                        }, 200);
                    }
                }
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
        
        // diagonal movement
//        if (keysPressed[38] === 1 && keysPressed[37] === 1) {
//            player.rotation = 225;
//        }
//        if (keysPressed[38] === 1 && keysPressed[39] === 1) {
//            player.rotation = 315;
//        }
//        if (keysPressed[40] === 1 && keysPressed[37] === 1) {
//            player.rotation = 135;
//        }
//        if (keysPressed[40] === 1 && keysPressed[39] === 1) {
//            player.rotation = 45;
//        }
        
    }
    
    function handleTick() {
        
        detectKeys();
        stage.update();
    
    }
    
    function init() {
        
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
            addPlayer(3, 4, 0);
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