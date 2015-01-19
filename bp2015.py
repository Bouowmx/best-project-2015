import uwsgi

def application(env, start_response):
	uwsgi.websocket_handshake(env["HTTP_SEC_WEBSOCKET_KEY"], env.get("HTTP_ORIGIN", ""))
	if (not uwsgi.cache_exists("chats")):
		uwsgi.cache_update("chats", "\x1e")
	if (not uwsgi.cache_exists("names")):
		uwsgi.cache_update("names", "\x1f")
	if (not uwsgi.cache_exists("roomNumbers")):
		uwsgi.cache_update("roomNumbers", "\x1f")
	#Static data for testing:
	if (uwsgi.cache_get("roomNumbers") == "\x1f"):
		uwsgi.cache_update("roomNumbers", uwsgi.cache_get("roomNumbers") + "\x1f".join([str(number) for number in [0, 10, 11, 12]]))
	if (not uwsgi.cache_exists("0")):
		uwsgi.cache_update("0", "1\x1eReimu\x1f1\x1f1\x1eMarisa\x1f2\x1f2\x1eRumia\x1f3\x1f3\x1eDaiyousei\x1f4\x1f4")
	if (not uwsgi.cache_exists("10")):
		uwsgi.cache_update("10", "2\x1eCirno\x1f1\x1f1\x1eMeiling\x1f2\x1f2\x1eKoakuma\x1f3\x1f3\x1ePatchouli\x1f4\x1f4")
	if (not uwsgi.cache_exists("11")):
		uwsgi.cache_update("11", "3\x1eSakuya\x1f1\x1f1\x1eRemilia\x1f2\x1f2\x1eFlandre\x1f3\x1f3\x1eLetty\x1f4\x1f4")
	if (not uwsgi.cache_exists("12")):
		uwsgi.cache_update("12", "0\x1eChen\x1f\x1f\x1e\x1f\x1f\x1e\x1f\x1f\x1e\x1f\x1f")
	playersMax = 4
	nameChat = ""
	roomsMax = 100
	roomNumberChat = -1
	while (True):
		msg = uwsgi.websocket_recv()
		msg_type = ""
		msg_data = ""
		if (msg and (msg != "\x06")):
			msg_type = msg.split("\x1c")[0]
			msg_data = msg.split("\x1c")[1]
			print "Message: " + repr(msg) + "; " + "Type: " + repr(msg_type) + "; " + "Data: " + repr(msg_data)
		if (msg_type == "chat"):
			chats = uwsgi.cache_get("chats")
			chats += "\x1e" + msg_data + "\x1f"
			uwsgi.cache_update("chats", chats)
		if (msg_type == "close"):
			roomNumber = msg_data.split("\x1f")[0]
			name = msg_data.split("\x1f")[1]
			if (name):
				names = uwsgi.cache_get("names").split("\x1f")
				names.remove(name)
				uwsgi.cache_update("names", "\x1f".join(names))
				chats = uwsgi.cache_get("chats").split("\x1e")
				i = 0
				while (i < len(chats)):
					chat = chats[i].split("\x1f")
					if (name in chats[3:]):
						del chat[chat.index(name, 3)]
						chats[i] = "\x1f".join(chat)
			if (int(roomNumber) > -1):
				room = uwsgi.cache_get(roomNumber).split("\x1e")
				i = 1
				while (i < len(room)):
					if (name == room[i].split("\x1f")[0]):
						room[i] = "\x1f\x1f"
						room = "\x1e".join(room)
						uwsgi.cache_update(roomNumber, room)
						if (room[room.index("\x1e"):] == playersMax * "\x1e\x1f\x1f"):
							roomNumbers = uwsgi.cache_get("roomNumbers").split("\x1f")
							roomNumbers.remove(roomNumber)
							uwsgi.cache_update("roomNumbers", "\x1f".join(roomNumbers))
							uwsgi.cache_del(roomNumber)
						break
					i += 1
				print name + " disconnected."
			return [""]
		if (msg_type == "leave"):
			roomNumber = msg_data.split("\x1f")[0]
			name = msg_data.split("\x1f")[1]
			room = uwsgi.cache_get(roomNumber).split("\x1e")
			i = 1
			while (i < len(room)):
				if (name == room[i].split("\x1f")[0]):
					room[i] = "\x1f\x1f"
					room = "\x1e".join(room)
					uwsgi.cache_update(roomNumber, room)
					if (room[room.index("\x1e"):] == playersMax * "\x1e\x1f\x1f"):
						roomNumbers = uwsgi.cache_get("roomNumbers").split("\x1f")
						roomNumbers.remove(roomNumber)
						uwsgi.cache_update("roomNumbers", "\x1f".join(roomNumbers))
						uwsgi.cache_del(roomNumber)
						roomNumberChat = -1
					break
				i += 1
		if (msg_type == "join"):
			roomNumber = msg_data.split("\x1f")[0]
			name = msg_data.split("\x1f")[1]
			room = uwsgi.cache_get(roomNumber).split("\x1e")
			if (room[0] != "0"):
				uwsgi.websocket_send("false")
			else:
				i = 1
				while (i < len(room)):
					if ((room[i] == "\x1f\x1f") and (room[i] != name + "\x1f\x1f")):
						room[i] = name + room[i]
						room = "\x1e".join(room)
						uwsgi.cache_update(roomNumber, room)
						uwsgi.websocket_send(room)
						roomNumberChat = int(roomNumber)
						break
					i += 1
				else:
					uwsgi.websocket_send("false")
		if (msg_type == "name"):
			if (msg_data in uwsgi.cache_get("names").split("\x1f")):
				uwsgi.websocket_send("false")
			else:
				names = uwsgi.cache_get("names").split("\x1f")
				names.append(msg_data)
				uwsgi.cache_update("names", "\x1f".join(names))
				print msg_data + " connected."
				nameChat = msg_data
				uwsgi.websocket_send("true")
		if (msg_type == "roomCreate"):
			roomNumbers = uwsgi.cache_get("roomNumbers").split("\x1f")
			if (len(roomNumbers) == 100): #The cache is full
				uwsgi.websocket_send("false")
			roomNumbers = [int(number) for number in roomNumbers if number]
			#Not most efficient but easy way to find the lowest available room number:
			roomNumber = 0
			while (roomNumber in roomNumbers):
				roomNumber += 1
			roomNumbers.append(roomNumber)
			roomNumbers = sorted(roomNumbers)
			uwsgi.cache_update("roomNumbers", "\x1f".join([str(number) for number in roomNumbers]))
			roomNumberChat = roomNumber
			roomNumber = str(roomNumber)
			uwsgi.cache_update(roomNumber, "0" + "\x1e" + msg_data + "\x1f\x1f" + (playersMax - 1) * "\x1e\x1f\x1f")
			uwsgi.websocket_send(roomNumber)
		if (msg_type == "rooms"):
			rooms = []
			for number in uwsgi.cache_get("roomNumbers").split("\x1f"):
				if (number):
					rooms.append(number + "\x1e" + uwsgi.cache_get(number))
			uwsgi.websocket_send("\x1d".join(rooms))
		if (msg_type == "wait"):
			uwsgi.websocket_send(uwsgi.cache_get(msg_data.split("\x1f")[0]))
		chats = uwsgi.cache_get("chats")
		chats = chats.split("\x1e")
		i = 0
		while (i < len(chats)):
			chat = chats[i].split("\x1f")
			if (chat == [""]):
				i += 1
				continue
			if (nameChat not in chat[3:]):
				chat.append(nameChat)
				chats[i] = "\x1f".join(chat)
				if (roomNumberChat == int(chat[0])):
					uwsgi.websocket_send("chat\x1c" + chat[1] + "\x1f" + chat[2])
				names = uwsgi.cache_get("names").split("\x1f")
				namesChat = chat[3:]
				for name in names:
					if (name not in namesChat):
						break
				else:
					del chats[i]
			i += 1
		uwsgi.cache_update("chats", "\x1e".join(chats))
