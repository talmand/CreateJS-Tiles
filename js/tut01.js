/*jslint nomen: true, browser: true, devel: true, plusplus: true */
/*global Image, Audio, createjs */

(function () {

    'use strict';
    
    var $container, canvas, stage, canvasW, canvasH,
        manifest, totalLoaded, queue,
        map1, mapTiles, game, mapWidth, mapHeight, tileSheet, tiles, board;
    
    $container = document.getElementById("container");
    canvasW = 384;
    canvasH = 288;
    
    map1 = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
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
            }
        };
        
        tileIndex = 0;
        for (row = 0; row < mapHeight; row++) {
            for (col = 0; col < mapWidth; col++) {
                tileClone = tiles.clone();
                tileClone.name = "t_" + row + "_" + col;
                tileClone.gotoAndStop(map[row][col]);
                tileClone.x = col * tileSheet._frameWidth;
                tileClone.y = row * tileSheet._frameHeight;
                mapTiles["t_" + row + "_" + col] = {
                    index: tileIndex,
                    walkable: defineTile.walkable(row, col)
                };
                tileIndex++;
                board.addChild(tileClone);
            }
        }
        
    }
    
    function handleTick() {
        
        stage.update();
    
    }
    
    function init() {
        
        manifest = [
            {src: "images/tiles.png", id: "tiles"}
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
            buildMap(map1);
        }
        
        queue = new createjs.LoadQueue(false);
        queue.installPlugin(createjs.SoundJS);
        queue.addEventListener("fileload", handleFileLoad);
        queue.addEventListener("complete", handleComplete);
        queue.loadManifest(manifest);
        
        canvas = document.getElementById("canvas");
        stage = new createjs.Stage(canvas);
        stage.enableMouseOver(10);
        createjs.Touch.enable(stage);
        createjs.Ticker.setFPS(30);
        createjs.Ticker.useRAF = true;
        createjs.Ticker.addEventListener("tick", handleTick);
        
        // animation frames are not required
        tileSheet = new createjs.SpriteSheet({
            "images": ["images/tiles.png"],
            "frames": {
                "height": 48,
                "width": 48,
                "regX": 0,
                "regY": 0,
                "count": 2
            }
        });
        
        tiles = new createjs.BitmapAnimation(tileSheet);
        
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