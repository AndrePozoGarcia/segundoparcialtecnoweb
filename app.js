/* Andre Pozo [SIS-214 ] TECNOLOGÍAS WEB I [Par. 2] */

const API_KEY = 'TU_API_KEY_AQUI'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const seriesGrid    = document.getElementById('series-grid');
const loadingDiv    = document.getElementById('loading');
const errorDiv      = document.getElementById('error');
const errorMessage  = document.getElementById('error-message');
const resultsTitle  = document.getElementById('results-title');
const resultsCount  = document.getElementById('results-count');
const searchInput   = document.getElementById('search');
const clearBtn      = document.getElementById('clear-search');
const retryBtn      = document.getElementById('retry-btn');
const themeToggle   = document.getElementById('theme-toggle');
const modal         = document.getElementById('serie-modal');
const modalBody     = document.getElementById('modal-body');
const modalClose    = document.getElementById('modal-close');
const modalOverlay  = document.getElementById('modal-overlay');


// ============================================================================
// UTILIDADES DE UI (DADO - no modificar)
// ============================================================================
const mostrarLoading = () => {
    loadingDiv.style.display = 'flex';
    errorDiv.style.display = 'none';
    seriesGrid.innerHTML = '';
};

const ocultarLoading = () => {
    loadingDiv.style.display = 'none';
};

const mostrarError = (mensaje) => {
    ocultarLoading();
    errorMessage.textContent = mensaje;
    errorDiv.style.display = 'flex';
    seriesGrid.innerHTML = '';
};


// ============================================================================
// DARK MODE (DADO - no modificar)
// ============================================================================
const aplicarTema = (tema) => {
    document.documentElement.setAttribute('data-theme', tema);
    themeToggle.textContent = tema === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', tema);
};

const cargarTema = () => {
    const guardado = localStorage.getItem('theme');
    const preferido = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    aplicarTema(guardado || preferido);
};

themeToggle.addEventListener('click', () => {
    const actual = document.documentElement.getAttribute('data-theme');
    aplicarTema(actual === 'dark' ? 'light' : 'dark');
});

cargarTema();


// ############################################################################
// #                                                                          #

const obtenerSeriesPopulares = async () => {
    const url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=es-ES`;
    const respuesta = await fetch (url);
    const datos = await respuesta.json();
    return datos.results
}

const crearTarjeta = (serie) => {
    const { name, first_air_date, vote_average, poster_path } = serie;
    const año = first_air_date ? first_air_date.split('-')[0] : 'N/A';
    const imagen = poster_path ? `${IMAGE_URL}${poster_path}` : '';
    const rating = vote_average ? vote_average.toFixed(1) : 'N/A';
    return `
        <article class="serie-card">
            <div class="serie-card__poster">
                <img class="serie-card__image" src="${imagen}" alt="${name}">
                <span class="serie-card__rating">${rating}</span>
            </div>
            <div class="serie-card__content">
                <h3 class="serie-card__title">${name}</h3>
                <p class="serie-card__year">${año}</p>
            </div>
        </article>
    `;
}

mostrarLoading();
try {
    const series = await obtenerSeriesPopulares();
    console.log(`${series.length} series obtenidas`);
    ocultarLoading();
    seriesGrid.innerHTML = series.map(crearTarjeta).join('');
    console.log('Series populares renderizadas');
} catch (error) {
    console.log('Error', error);
    let mensaje = 'No se pudieron cargar las series';
    if (error && error.message && error.message.includes('401')) {
        mensaje = 'API Key inválida, verifica tu clave';
    } else if (error && error.message && error.message.includes('fetch')) {
        mensaje = 'Error de red';
    }
    mostrarError(mensaje);
}

const crearTarjetaSerie = (serie) => {
    const { name, first_air_date, vote_average, poster_path } = serie;
    const año = first_air_date ? first_air_date.split('-')[0] : 'N/A';
    const imagen = poster_path ? IMAGE_URL + poster_path : '';
    const rating = vote_average ? vote_average.toFixed(1) : 'N/A';

    return `
        <article class="serie-card">
            <div class="serie-card__poster">
                <img class="serie-card__image" src="${imagen}" alt="${name}">
                <span class="serie-card__rating">${rating}</span>
            </div>
            <div class="serie-card__content">
                <h3 class="serie-card__title">${name}</h3>
                <p class="serie-card__year">${año}</p>
            </div>
        </article>
    `;
};

const buscarSeries = async (query) => {
    const url = `${BASE_URL}/search/tv?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`;
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    return datos.results;
};

searchInput.addEventListener('input', async (e) => {
    const query = e.target.value;
    if (!query.trim()) return;

    mostrarLoading();
    try {
        const series = await buscarSeries(query);
        ocultarLoading();
        seriesGrid.innerHTML = series.map(crearTarjetaSerie).join('');
        console.log(`${series.length} series encontradas`);
    } catch (error) {
        console.log('Error', error);
        mostrarError('No se pudo realizar la búsqueda');
    }
});

clearBtn.addEventListener('click', async () => {
    searchInput.value = '';
    mostrarLoading();
    try {
        const series = await obtenerSeriesPopulares();
        ocultarLoading();
        seriesGrid.innerHTML = series.map(crearTarjetaSerie).join('');
        console.log('Series populares restauradas');
    } catch (error) {
        console.log('Error', error);
        mostrarError('No se pudieron cargar las series');
    }
});

const obtenerDetalleSerie = async (id) => {
    const url = `${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=es-ES`;
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    return datos;
};

const mostrarModal = async (id) => {
    try {
        const serie = await obtenerDetalleSerie(id);
        const { name, overview, number_of_seasons, number_of_episodes, genres, status } = serie;
        const generosTexto = genres ? genres.map(g => g.name).join(', ') : 'N/A';

        modalBody.innerHTML = `
            <h2 class="modal__title">${name}</h2>
            <div class="modal__info">
                <span><strong>Temporadas:</strong> ${number_of_seasons}</span>
                <span><strong>Episodios:</strong> ${number_of_episodes}</span>
                <span><strong>Estado:</strong> ${status}</span>
            </div>
            <p><strong>Géneros:</strong> ${generosTexto}</p>
            <p class="modal__overview">${overview || 'Sin descripción disponible.'}</p>
        `;
        modal.classList.add('modal--show');
    } catch (error) {
        console.log('Error', error);
    }
};

seriesGrid.addEventListener('click', (e) => {
    const tarjeta = e.target.closest('.serie-card');
    if (tarjeta && tarjeta.dataset.id) {
        mostrarModal(tarjeta.dataset.id);
    }
});

modalClose.addEventListener('click', () => {
    modal.classList.remove('modal--show');
});

modalOverlay.addEventListener('click', () => {
    modal.classList.remove('modal--show');
});

// #                                                                          #
// ############################################################################