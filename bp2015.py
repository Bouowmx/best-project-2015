import uwsgi

def application(env, start_response):
	uwsgi.websocket_handshake(env["HTTP_SEC_WEBSOCKET_KEY"], env.get("HTTP_ORIGIN", ""))
	if (not uwsgi.cache_exists("chats")):
		uwsgi.cache_update("chats", "")
	if (not uwsgi.cache_exists("names")):
		uwsgi.cache_update("names", "")
	if (not uwsgi.cache_exists("roomNumbers")):
		uwsgi.cache_update("roomNumbers", "")
	#Static data for testing:
	if (uwsgi.cache_get("roomNumbers") == ""):
		uwsgi.cache_update("roomNumbers", uwsgi.cache_get("roomNumbers") + "".join([str(number) for number in [0, 10, 11, 12]]))
	if (not uwsgi.cache_exists("0")):
		uwsgi.cache_update("0", "1Reimu11Marisa22Rumia33Daiyousei44")
	if (not uwsgi.cache_exists("10")):
		uwsgi.cache_update("10", "2Cirno11Meiling22Koakuma33Patchouli44")
	if (not uwsgi.cache_exists("11")):
		uwsgi.cache_update("11", "3Sakuya11Remilia22Flandre33Letty44")
	if (not uwsgi.cache_exists("12")):
		uwsgi.cache_update("12", "0Chen")
	playersMax = 4
	nameChat = ""
	roomsMax = 100
	roomNumberChat = -1
	while (True):
		msg = uwsgi.websocket_recv()
		msg_type = ""
		msg_data = ""
		if (msg and (msg != "\x06")):
			msg_type = msg.split("")[0]
			msg_data = msg.split("")[1]
			print "Message: " + repr(msg) + "; " + "Type: " + repr(msg_type) + "; " + "Data: " + repr(msg_data)
		if (msg_type == "chat"):
			chats = uwsgi.cache_get("chats")
			chats += "" + msg_data + ""
			uwsgi.cache_update("chats", chats)
		if (msg_type == "close"):
			roomNumber = msg_data.split("")[0]
			name = msg_data.split("")[1]
			if (name):
				names = uwsgi.cache_get("names").split("")
				names.remove(name)
				uwsgi.cache_update("names", "".join(names))
				chats = uwsgi.cache_get("chats").split("")
				i = 0
				while (i < len(chats)):
					chat = chats[i].split("")
					if (name in chats[3:]):
						del chat[chat.index(name, 3)]
						chats[i] = "".join(chat)
			if (int(roomNumber) > -1):
				room = uwsgi.cache_get(roomNumber).split("")
				i = 1
				while (i < len(room)):
					if (name == room[i].split("")[0]):
						room[i] = ""
						room = "".join(room)
						uwsgi.cache_update(roomNumber, room)
						if (room[room.index(""):] == playersMax * ""):
							roomNumbers = uwsgi.cache_get("roomNumbers").split("")
							roomNumbers.remove(roomNumber)
							uwsgi.cache_update("roomNumbers", "".join(roomNumbers))
							uwsgi.cache_del(roomNumber)
						break
					i += 1
				print name + " disconnected."
			return [""]
		if (msg_type == "leave"):
			roomNumber = msg_data.split("")[0]
			name = msg_data.split("")[1]
			room = uwsgi.cache_get(roomNumber).split("")
			i = 1
			while (i < len(room)):
				if (name == room[i].split("")[0]):
					room[i] = ""
					room = "".join(room)
					uwsgi.cache_update(roomNumber, room)
					if (room[room.index(""):] == playersMax * ""):
						roomNumbers = uwsgi.cache_get("roomNumbers").split("")
						roomNumbers.remove(roomNumber)
						uwsgi.cache_update("roomNumbers", "".join(roomNumbers))
						uwsgi.cache_del(roomNumber)
						roomNumberChat = -1
					break
				i += 1
		if (msg_type == "join"):
			roomNumber = msg_data.split("")[0]
			name = msg_data.split("")[1]
			room = uwsgi.cache_get(roomNumber).split("")
			if (room[0] != "0"):
				uwsgi.websocket_send("false")
			else:
				i = 1
				while (i < len(room)):
					if ((room[i] == "") and (room[i] != name + "")):
						room[i] = name + room[i]
						room = "".join(room)
						uwsgi.cache_update(roomNumber, room)
						uwsgi.websocket_send(room)
						roomNumberChat = int(roomNumber)
						break
					i += 1
				else:
					uwsgi.websocket_send("false")
		if (msg_type == "name"):
			if (msg_data in uwsgi.cache_get("names").split("")):
				uwsgi.websocket_send("false")
			else:
				names = uwsgi.cache_get("names").split("")
				names.append(msg_data)
				uwsgi.cache_update("names", "".join(names))
				print msg_data + " connected."
				nameChat = msg_data
				uwsgi.websocket_send("true")
		if (msg_type == "roomCreate"):
			roomNumbers = uwsgi.cache_get("roomNumbers").split("")
			if (len(roomNumbers) == 100): #The cache is full
				uwsgi.websocket_send("false")
			roomNumbers = [int(number) for number in roomNumbers if number]
			#Not most efficient but easy way to find the lowest available room number:
			roomNumber = 0
			while (roomNumber in roomNumbers):
				roomNumber += 1
			roomNumbers.append(roomNumber)
			roomNumbers = sorted(roomNumbers)
			uwsgi.cache_update("roomNumbers", "".join([str(number) for number in roomNumbers]))
			roomNumberChat = roomNumber
			roomNumber = str(roomNumber)
			uwsgi.cache_update(roomNumber, "0" + "" + msg_data + "" + (playersMax - 1) * "")
			uwsgi.websocket_send(roomNumber)
		if (msg_type == "rooms"):
			rooms = []
			for number in uwsgi.cache_get("roomNumbers").split(""):
				if (number):
					rooms.append(number + "" + uwsgi.cache_get(number))
			uwsgi.websocket_send("".join(rooms))
		if (msg_type == "wait"):
			uwsgi.websocket_send(uwsgi.cache_get(msg_data.split("")[0]))
		chats = uwsgi.cache_get("chats")
		chats = chats.split("")
		i = 0
		while (i < len(chats)):
			chat = chats[i].split("")
			if (chat == [""]):
				i += 1
				continue
			if (nameChat not in chat[3:]):
				chat.append(nameChat)
				chats[i] = "".join(chat)
				if (roomNumberChat == int(chat[0])):
					uwsgi.websocket_send("chat" + chat[1] + "" + chat[2])
				names = uwsgi.cache_get("names").split("")
				namesChat = chat[3:]
				for name in names:
					if (name not in namesChat):
						break
				else:
					del chats[i]
			i += 1
		uwsgi.cache_update("chats", "".join(chats))
