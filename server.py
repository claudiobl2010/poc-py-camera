import base64
import uuid

from flask import Flask, render_template
from flask_socketio import SocketIO, send

app = Flask(__name__)

app.template_folder = '%s/web/templates' % app.root_path
app.static_folder = '%s/web/static' % app.root_path

socketio = SocketIO(app)

qtd_processed = 0

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect', namespace='/ws')
def handle_connect():
    global qtd_processed
    qtd_processed = 0
    print("Cliente conectado!")

@socketio.on('disconnect', namespace='/ws')
def handle_disconnect():
    print("Cliente desconectado!")

@socketio.on('message', namespace='/ws')
def handle_message(msg):    
    for imgs in msg['imgs']:
        file_prefix_name = str(uuid.uuid4())

        # RGB
        img_rgb_raw = imgs['imgRGB']

        if img_rgb_raw.startswith('data:image'):
            _, img_rgb = img_rgb_raw.split(',', 1)

        img_rgb_bytes = base64.b64decode(img_rgb)

        # img_rgb_file = open('./data_imgs/%s_rgb.jpg' % file_prefix_name, 'wb')
        # img_rgb_file.write(img_rgb_bytes)
        # img_rgb_file.close()

        # Depth
        img_depth_raw = imgs['imgDepth']

        if img_depth_raw.startswith('data:image'):
            _, img_depth = img_depth_raw.split(',', 1)

        img_depth_bytes = base64.b64decode(img_depth)

        # img_depth_file = open('./data_imgs/%s_depth.jpg' % file_prefix_name, 'wb')
        # img_depth_file.write(img_depth_bytes)
        # img_depth_file.close()

    global qtd_processed
    qtd_processed += len(msg['imgs'])
    print('Mensagem recebida! [%s]' % qtd_processed)
    send(qtd_processed)

@socketio.on('error', namespace='/ws')
def handle_error(error):
    print(f"Ocorreu um erro: {error}")

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
