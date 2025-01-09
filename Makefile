setup:
	@PIP_REQUIRE_VIRTUALENV=1 pip install -r requirements.txt --no-deps

start:
	@FLASK_ENV=development \
	FLASK_APP=src/app/server.py \
	flask run --host 0.0.0.0 --port 5000

gunicorn:
#	@gunicorn --certfile certificados/certificado.pem --keyfile certificados/chave.key --bind 0.0.0.0:5000 --chdir src --worker-class eventlet --workers 1 app.server:app
	@gunicorn --bind 0.0.0.0:5000 --chdir src --worker-class eventlet --workers 1 app.server:app