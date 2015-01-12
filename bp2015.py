import uwsgi

def application(env, start_response):
	uwsgi.websocket_handshake(env['HTTP_SEC_WEBSOCKET_KEY'], env.get('HTTP_ORIGIN', ''))
	if (not uwsgi.cache_exists("names")):
		uwsgi.cache_update("names", "\x1f")
	if (not uwsgi.cache_exists("rooms")):
		uwsgi.cache_update("rooms", "\x1d")
	while (True):
		msg = uwsgi.websocket_recv()
		msg_type = msg.split("\x1c")[0]
		msg_data = msg.split("\x1c")[1]
		print '''Message: "''' + msg + '''"''' + "; " + '''Message Type: "''' + msg_type + '''"''' + "; " + '''Message Data: "''' + msg_data + '''"'''
		if (msg_type == "close"):
			if (msg_data != ""):
				names = uwsgi.cache_get("names").split("\x1f")
				names.remove(msg_data)
				uwsgi.cache_update("names", "\x1f".join(names))
				print msg_data + " disconnected."
				print names
			return [""]
		if (msg_type == "name"):
			if (msg_data in uwsgi.cache_get("names").split("\x1f")):
				uwsgi.websocket_send("false")
			else:
				names = uwsgi.cache_get("names").split("\x1f")
				names.append(msg_data)
				uwsgi.cache_update("names", "\x1f".join(names))
				print msg_data + " connected."
				print uwsgi.cache_get("names").split("\x1f")
				uwsgi.websocket_send("true")
		if (msg_type == "roomCreate"):
			roomNumbers = [];
			rooms = uwsgi.cache_get("rooms").split("\x1d")
			for room in rooms:
				roomNumbers.append(room[:room.index("\x1e")])
			roomNumber = 0
			for number in roomNumbers[1:]:
				if (number - roomNumber >= 1):
					uwsgi.websocket_send(str(roomNumber + 1))
					break
				else:
					roomNumber = number
			if (roomNumber == roomNumbers[len(roomNumbers) - 1]):
				uwsgi.websocket_send(str(roomNumber + 1))
			
		if (msg_type == "rooms"):
			#uwsgi.websocket_send(uwsgi.cache_get("rooms"))
			uwsgi.websocket_send("\x1d\x1d10\x1e1\x1e1\x1f1\x1e2\x1f2\x1e3\x1f3\x1e4\x1f4\x1d11\x1e3\x1e1\x1f1\x1e2\x1f2\x1e3\x1f3\x1e4\x1f4")
		if (msg_type == "wait"):
			roomNumber = msg_data.split("\x1d")[0];
			name = msg_data.split("\x1d")[1];
			rooms = uwsgi.cache_get("rooms").split("\x1d")
			#Find the room.
