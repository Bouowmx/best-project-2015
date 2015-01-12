best-project-2015
=================
Albert Yeung

Sean Yip

Steven Zabolotny

Richard Zhan
#Instructions
Do not go to website `bp2015.themafia.info`. You will not see anything useful.

`maps.html` is a demonstration of how a player moves in-game.
`bp2015.*` is a demonstration of how a player connects to the game. Note: you cannot see maps in `bp2015.html`.

Running `bp2015.*` requires `uwsgi`. Install in Debian-based systems using `sudo apt-get install uwsgi`. In `bp2015.js`, change `ws://bp2015.themafia.info:9090` to `ws://<your server domain or server IP address>:9090` since you cannot log in to `bp2015.themafia.info` to start the server.

Change to project directory.

To start server: `./bp2015.sh`

To play, open `bp2015.html`.

#To-do
###Map
* Interactive Google Maps
* Creating players on top of the Google Maps
* Players can move
* Players can move according to street
* Players can move according to subway

###Interface
* A website
* Temporary Username
* A chat box

###Game
* Design the specific mechanics of the game
* Serial Killer can kill
* Red pointer to dead area
