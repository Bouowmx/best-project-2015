import uwsgi

def application(env, start_response):
	uwsgi.websocket_handshake(env['HTTP_SEC_WEBSOCKET_KEY'], env.get('HTTP_ORIGIN', ''))
	names = []
	while (True):
		message = uwsgi.websocket_recv()
		if (message[:5] == "name;"):
			print message
		if (message[5:] in names):
			uwsgi.websocket_send("false")
		else:
			print message[5:]
			names.append(message[5:])
			print names
			uwsgi.websocket_send("true")
