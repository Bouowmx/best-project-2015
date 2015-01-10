uwsgi --http :9090 --http-websockets --master --processes 4 --stats 127.0.0.1:9091 --threads 2 --wsgi-file bp2015.py
