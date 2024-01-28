let imagesData = [];

// Agregar una imagen de inicio al carrusel
let carouselContainer = document.getElementById('carouselImages');
let initialImage = new Image();
initialImage.src = '/static/20.jpg'; // Ruta relativa a la carpeta 'static'
carouselContainer.appendChild(initialImage);

document.getElementById('uploadButton').addEventListener('click', function() {
    let images = document.getElementById('imageInput').files;
    let numberOfImages = images.length;

    // Actualizar el contador de créditos
    let creditCounter = document.getElementById('creditCounter');
    let currentCredits = parseInt(creditCounter.textContent);
    let requiredCredits = numberOfImages * 10;

    if (currentCredits >= requiredCredits) {
        creditCounter.textContent = currentCredits - requiredCredits;
    } else {
        // Deshabilitar botón y mostrar mensaje si no hay suficientes créditos
        alert('No tienes suficientes créditos para subir estas imágenes.');
        return;
    }

    // Limpiar carrusel antes de agregar nuevas imágenes
    carouselContainer.innerHTML = '';

    Array.from(images).forEach((image, index) => {
        let formData = new FormData();
        formData.append('file', image);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data);
            imagesData.push({ temp_path: data.temp_path, prediction: data.prediction });

            // Crear contenedor del item del carrusel
            let carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item' + (imagesData.length === 1 ? ' active' : '');

            // Crear y añadir el elemento de imagen
            let imgElement = document.createElement('img');
            imgElement.src = URL.createObjectURL(image);
            carouselItem.appendChild(imgElement);

            // Crear y añadir el elemento de categoría predicha
            let captionElement = document.createElement('div');
            captionElement.className = 'caption';
            captionElement.textContent = 'Categoría: ' + data.prediction.join(', ');
            carouselItem.appendChild(captionElement);

            // Añadir el item del carrusel al contenedor del carrusel
            carouselContainer.appendChild(carouselItem);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // Centrar horizontalmente las imágenes en el carrusel
    $('#carouselExample').carousel();
});

document.getElementById('downloadButton').addEventListener('click', function() {
    fetch('/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: imagesData })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Predicciones.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Función para crear un nuevo carrusel
function createNewCarousel(carouselNumber, container) {
    let carouselHtml = `
            <div id="carousel${carouselNumber}" class="carousel slide" data-ride="carousel">
                <!-- Indicadores -->
                <ol class="carousel-indicators">
                    <li data-target="#carousel${carouselNumber}" data-slide-to="0" class="active"></li>
                </ol>
                <!-- Carrusel de imágenes -->
                <div class="carousel-inner" role="listbox">
                    <!-- Las imágenes del carrusel se añadirán aquí mediante JavaScript -->
                </div>
                <!-- Controles de navegación -->
                <a class="carousel-control-prev" href="#carousel${carouselNumber}" role="button" data-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="sr-only">Anterior</span>
                </a>
                <a class="carousel-control-next" href="#carousel${carouselNumber}" role="button" data-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="sr-only">Siguiente</span>
                </a>
            </div>
    `;
    let carouselWrapper = document.createElement('div');
    carouselWrapper.className = 'col-md-4'; // Ajusta la clase de columna según tus necesidades
    carouselWrapper.innerHTML = carouselHtml;
    container.appendChild(carouselWrapper);
}


