best-project-2015
=================
Albert Yeung

Sean Yip

Steven Zabolotny

Richard Zhan
#Instructions

`maps.html` is a demonstration of how a player moves in-game.
`bp2015.*` is a demonstration of how a player connects to the game. Note: you cannot see maps in `bp2015.html`.

Running `bp2015.*` requires `uwsgi`. Install in Debian-based systems using `sudo apt-get install uwsgi`. In `bp2015.js`, change `ws://bp2015.themafia.info:9090` to `ws://<your server domain or server IP address>:9090` (not your local IP address but Digital Ocean) since you cannot log in to `bp2015.themafia.info` to start the server.

To start server, change to project direactory and run `./bp2015.sh`

#To-do
###Map
* Interactive Google Maps [Done]
* Creating players on top of the Google Maps [One character]
* Players can move [Done]
* Players can move according to street [Done]
* Players cannot island hop
* Players' circles are vision
* Players can move according to subway

###Interface
* A website [Done]
* Rooms [Done]
* Lobby
* Temporary Username
* A chat box

###Game
* Design the specific mechanics of the game [Done]
* Serial Killer can kill
* Red pointer to dead area
* Players can vote to lynch
