CreateJS-Tiles
=============

Basic tile maps using CreateJS.

This was a learning excerise in building simple tile maps using EaselJS. These are heavily based on TonyPa's old Flash tutorials at http://www.tonypa.pri.ee/tbw/index.html of which I suggest you look through as they cover more aspects than what I play with here. Most of the code for those Flash tutorials are probably out of style and considered outdated but it's fun to look how things were done around the Flash 5 days. Needless to say I didn't follow everything in the Flash versions for my code.

I did this just to see what would be involved in building a basic tile map system so I didn't necessarily worry over coding style or optimization. If I were to start over I'm sure I would do some things differently. Just keep in mind this was a learning exercise for me and I'm just sharing what I came up with. I have no idea if I would actually use any of this in a game but I guess I would use elements of it.

There is a severe lack of comments in the code but for the most part it should be easy to read through to understand what's going on. The first part starts with simple functions that loads resources, inits, builds map, and resizes the container as needed based on window width. The resize function is based on code from this page, http://blogs.msdn.com/b/davrous/archive/2012/04/06/modernizing-your-html5-canvas-games-with-offline-apis-file-apis-css3-amp-hardware-scaling.aspx, that I found via the CreateJS home page.

So I share with you my fun little project.

What's in it?
-------------

I followed TonyPa's naming scheme but my files do not follow those one-to-one.

### tut01

This is about the simplest you can get in terms of displaying a tile map. There's an init function that loads the assets using PreloadJS and a buildMap function that obviously builds the map using an array structure. It's simple in that 0 is a solid and 1 is walkable, not that it matters with no player character.

### tut02

This builds on tut01 and introduces a controllable character. So now there are addPlayer, moveChar, and detectKeys functions to handle all this. The collision detection uses a check-ahead system to see if the location of the next step is inside a solid tile, if it is then that direction is blocked.

### tut03

This adds in the ability to rebuild the map on the fly based on the player entering a certain type of tile. This is done through the warpChar function that you feed where you want the player to move to. In this example everything is hardcoded so that if player is on the right side then it is warped to the left and the map rebuilt. Vice-versa for the left side. To use this method better it's suggested to put in the map array the warp coordinates to remove some annoying limitations but that's outside the scope of this.

### tut04

This is not much different than tut03 except that it has a much larger tile array as opposed to several arrays with warping the character around. I just did this to test a larger size and possibly experiment with various ideas on optimization. With so few resources involved it performs quite well but to test performance properly it would need more resources loaded to stress things more fairly. I just simply decided not to go down that path at the moment.

### tut05

This adds in some basic AI characters to the map. They use the same collision detection as the player which has been placed in its own checkCorners function. An addEnemy function was added that's similar to the addPlayer function. The enemyBrain function controls the thinking of the enemy characters. It simply tells the enemy to walk forward until it hits a wall and then randomly picks another direction to move. To build on this randomness there's a timer that forces the enemy to pick a different random direction every five seconds. If the enemy gets within a certain distance of the player it will attempt to approach and if getting there stops walking. It's not the brightest and gets stuck on corners easily but it works decently enough.

### tut06

An experiment in making a basic lighting system by altering the alpha of the tiles and enemies based on distance from the player.

License
-------

Simple, there isn't one. Feel free to use anything as you wish as you are on your own, although a friendly mention would be appreciated.