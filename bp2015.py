import uwsgi

names = []
def application(env, start_response):
	uwsgi.websocket_handshake(env['HTTP_SEC_WEBSOCKET_KEY'], env.get('HTTP_ORIGIN', ''))
	#names = []
	while (True):
		msg = uwsgi.websocket_recv()
		semicolon = msg.find(";")
		msg_type = msg[:semicolon]
		msg_data = msg[semicolon + 1:]
		print '''Message: "''' + msg + '''"''' + "; " + '''Message Type: "''' + msg_type + '''"''' + "; " + '''Message Data: "''' + msg_data + '''"'''
		if (msg_type == "close"):
			if (msg_data in names):
				names.remove(msg_data)
				print msg_data + " disconnected."
				print names
			return [""]
		if (msg_type == "name"):
			if (msg_data in names):
				uwsgi.websocket_send("false")
			else:
				names.append(msg_data)
				print msg_data + " connected."
				print names
				uwsgi.websocket_send("true")
