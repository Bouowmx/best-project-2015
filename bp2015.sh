uwsgi --cache2 bitmap=1,items=103,name=memory --http :9090 --http-websockets --master --processes 4 --threads 2 --wsgi-file bp2015.py
