import uwsgi

def application(env, start_response):
	uwsgi.websocket_handshake(env['HTTP_SEC_WEBSOCKET_KEY'], env.get('HTTP_ORIGIN', ''))
	if (not uwsgi.cache_exists("names")):
		uwsgi.cache_update("names", "\x1f")
	if (not uwsgi.cache_exists("rooms")):
		uwsgi.cache_update("rooms", "\x1d\x1d10\x1e1\x1eReimu\x1f1\x1f1\x1eMarisa\x1f2\x1f2\x1eRumia\x1f3\x1f3\x1eDaiyousei4\x1f4\x1d11\x1e3\x1eMeiling\x1f1\x1f1\x1eKoakuma\x1f2\x1f2\x1ePatchouli\x1f3\x1f3\x1eSakuya4\x1f4")
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
				if (room == ""):
					continue
				roomNumbers.append(int(room[:room.index("\x1e")]))
			roomNumber = 0
			if (roomNumbers[0] != 0):
				uwsgi.websocket_send(str(0))
			else:
				for number in roomNumbers[1:]:
					if (number - roomNumber >= 1):
						uwsgi.websocket_send(str(roomNumber + 1))
						break
					else:
						roomNumber = number
			if (roomNumber == roomNumbers[len(roomNumbers) - 1]):
				uwsgi.websocket_send(str(roomNumber + 1))
			roomNumber += 1
			i = 0
			while (i < len(rooms) - 1):
				if (rooms[i] == ""):
					continue
				if (roomNumber > rooms[i][:rooms[i].index("\x1e")]):
					rooms.insert(i, str(roomNumber) + "\x1e1\x1e\x1f\x1f\x1e\x1f\x1f\x1e\x1f\x1f\x1e\x1f\x1f")
					break
				i += 1
			uwsgi.cache_update("rooms", "\x1e".join(rooms))
		if (msg_type == "rooms"):
			uwsgi.websocket_send(uwsgi.cache_get("rooms"))
		if (msg_type == "wait"):
			roomNumber = msg_data.split("\x1d")[0];
			name = msg_data.split("\x1d")[1];
			rooms = uwsgi.cache_get("rooms").split("\x1d")
			for room in rooms:
				if (room == ""):
					continue
				if (roomNumber == room[:room.index("\x1e")]):
					room = room.split("\x1e")
					#0: number, 1: current player, 2: P1, 3: P2, 4: P3, 5: P4
					i = 2
					while (i < len(room)):
						if (room[i] == "\x1f\x1f"):
							room[i] = name + room[i]
							break
						i += 1
					if (i == len(room) - 1):
						websocket_send("ready")
					room = "\x1e".join(room)
					uwsgi.cache_update("rooms", room)
					uwsgi.websocket_send(room)
