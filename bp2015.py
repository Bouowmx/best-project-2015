import uwsgi

def application(env, start_response):
	uwsgi.websocket_handshake(env['HTTP_SEC_WEBSOCKET_KEY'], env.get('HTTP_ORIGIN', ''))
	if (not uwsgi.cache_exists("names")):
		uwsgi.cache_update("names", "\x1f")
	while (True):
		msg = uwsgi.websocket_recv()
		msg_type = msg.split("\x1f")[0]
		msg_data = msg.split("\x1f")[1]
		print '''Message: "''' + msg + '''"''' + "; " + '''Message Type: "''' + msg_type + '''"''' + "; " + '''Message Data: "''' + msg_data + '''"'''
		if (msg_type == "close"):
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
