import tensorflow as tf
tf.config.set_visible_devices([], 'GPU')

import io
import zipfile
from flask import Flask, request, jsonify, render_template, send_file
import os
import tensorflow as tf
from werkzeug.utils import secure_filename
from tensorflow.keras.preprocessing import image
import numpy as np

app = Flask(__name__)

creditos_iniciales = 200

# Configurar la carpeta de plantillas
app.template_folder = 'templates'

# Cargar el modelo
modelo = tf.keras.models.load_model(r"C:\Users\Gonzalo\Desktop\Bootcamp\proyecto-final-gcb-hs\Clasificador\fine.h5")

# Configuración para la carga de archivos
UPLOAD_FOLDER = 'uploads'
TEMP_FOLDER = 'temp_uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

if not os.path.exists(TEMP_FOLDER):
    os.makedirs(TEMP_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def cargar_y_preparar_imagen(filename):
    img = image.load_img(filename, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0
    return img_array

@app.route('/')
def main():
    return render_template('principal.html')

@app.route('/prueba')
def index():
    return render_template('prueba.html')

@app.route('/precios')
def precios():
    return render_template('precios.html')
    


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        temp_path = os.path.join(TEMP_FOLDER, filename)
        file.save(temp_path)
        img_array = cargar_y_preparar_imagen(temp_path)
        prediction = modelo.predict(img_array)
        categorias = ['animales', 'ciudades', 'personas', 'ninguna']
        etiquetas_predichas = [categorias[i] for i, val in enumerate(prediction[0]) if val > 0.5]
        return jsonify({'temp_path': temp_path, 'prediction': etiquetas_predichas})
    return jsonify({'error': 'Invalid file type'})

from flask import send_file

from flask import Response

@app.route('/download', methods=['POST'])
def download_images():
    data = request.get_json()
    images = data['images']

    # Crear un buffer en memoria para el archivo ZIP
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for image_data in images:
            temp_path = image_data['temp_path']
            prediction = '_'.join(image_data['prediction'])
            if os.path.exists(temp_path):
                zip_file.write(temp_path, os.path.join(prediction, os.path.basename(temp_path)))

    zip_buffer.seek(0)

    # Configurar los encabezados para la descarga del archivo
    headers = {
        'Content-Disposition': 'attachment; filename=images.zip',
        'Content-Type': 'application/zip'
    }

    return Response(zip_buffer.getvalue(), mimetype='application/zip', headers=headers)




if __name__ == '__main__':
    app.run(debug=True)
