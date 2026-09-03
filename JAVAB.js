// Variables globales
let isPlaying = false;
let player = null;
let playerReady = false;
let currentSlide = 0;
let totalSlides = 0;
let enableMusic = false;

// Funciones globales para los botones del modal
function enterWithMusicClick() {
    // console.log('Función enterWithMusicClick() ejecutada');
    enableMusic = true;
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.display = 'none';
    }

    // El player se precarga desde DOMContentLoaded (ver loadYouTubeAPI más abajo),
    // así que si ya está listo llamamos playVideo() de inmediato, dentro del mismo
    // tick del click. Eso es justo lo que iOS Safari exige para permitir el audio;
    // si el player se crea o se reproduce de forma asíncrona (fuera del gesto del
    // usuario), iOS lo bloquea en silencio y por eso antes no sonaba en iPhone.
    if (playerReady && player) {
        document.getElementById('musicPlayer').style.display = 'block';
        player.playVideo();
        isPlaying = true;
        updateMusicIcon();
    }
    // Si el player todavía no está listo (conexión lenta), onPlayerReady se
    // encarga de reproducir apenas termine de inicializar.
}

function enterWithoutMusicClick() {
    // console.log('Función enterWithoutMusicClick() ejecutada');
    enableMusic = false;
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Función para configurar los botones directamente
function setupModalButtons() {
    const enterWithMusic = document.getElementById('enterWithMusic');
    const enterWithoutMusic = document.getElementById('enterWithoutMusic');
    const modal = document.getElementById('welcomeModal');

    // console.log('Configurando botones del modal...', { enterWithMusic, enterWithoutMusic, modal });

    if (enterWithMusic) {
        enterWithMusic.onclick = function() {
            // console.log('Botón CON música clickeado');
            enableMusic = true;
            if (modal) {
                modal.style.display = 'none';
            }
            // Mismo arreglo que en enterWithMusicClick: reproducir de forma
            // síncrona dentro del click si el player ya está precargado.
            if (playerReady && player) {
                const musicPlayer = document.getElementById('musicPlayer');
                if (musicPlayer) musicPlayer.style.display = 'block';
                player.playVideo();
                isPlaying = true;
                updateMusicIcon();
            }
        };
    }

    if (enterWithoutMusic) {
        enterWithoutMusic.onclick = function() {
            // console.log('Botón SIN música clickeado');
            enableMusic = false;
            if (modal) {
                modal.style.display = 'none';
            }
        };
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // console.log('DOM cargado, inicializando...');
    initializeCountdown();
    initializeCarousel();
    setupModalButtons();

    // Mostrar el modal de bienvenida para elegir con/sin música
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.display = 'flex';
    }

    // Se precarga el player de YouTube desde el inicio (no en el click) para
    // que playVideo() pueda ejecutarse de forma síncrona dentro del gesto del
    // usuario en enterWithMusicClick(). Esto es lo que exige iOS Safari.
    loadYouTubeAPI();
});

// También configurar cuando la página esté completamente cargada
window.addEventListener('load', function() {
    // console.log('Ventana completamente cargada');
    setupModalButtons();
});



// Cargar la API de YouTube
function loadYouTubeAPI() {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(script);
    window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
}

// Función llamada por la API de YouTube
function initializeYouTubePlayer() {
    if (player) return; // ya inicializado, evita crear el player dos veces

    player = new YT.Player('youtube-player', {
        height: '1',
        width: '1',
        videoId: 'jb0K64SGsfc',
        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            playlist: 'jb0K64SGsfc'
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    playerReady = true;
    const musicPlayer = document.getElementById('musicPlayer');
    const musicToggle = document.getElementById('musicToggle');

    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }

    // Caso borde: el usuario ya hizo click en "con música" antes de que el
    // player terminara de inicializar (ej. conexión lenta). Lo reproducimos
    // apenas esté listo.
    if (enableMusic && !isPlaying) {
        if (musicPlayer) musicPlayer.style.display = 'block';
        event.target.playVideo();
        isPlaying = true;
        updateMusicIcon();
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
    }
    updateMusicIcon();
}

function onPlayerError(event) {
    console.log('Error al cargar el video de YouTube');
    const musicPlayer = document.getElementById('musicPlayer');
    musicPlayer.style.display = 'block';
    isPlaying = false;
    updateMusicIcon();
}

function toggleMusic() {
    if (player) {
        if (isPlaying) {
            player.pauseVideo();
            isPlaying = false;
        } else {
            player.playVideo();
            isPlaying = true;
        }
        updateMusicIcon();
    }
}

function updateMusicIcon() {
    const volumeIcon = document.getElementById('volumeIcon');
    
    if (volumeIcon) {
        if (isPlaying) {
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#222" stroke="#fff" stroke-width="1"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.08" stroke="#222" stroke-width="2"></path>
                <circle cx="6.5" cy="12" r="1" fill="#ffe27a"/>
            `;
        } else {
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#222" stroke="#fff" stroke-width="1"></polygon>
                <line x1="19" y1="9" x2="17" y2="11" stroke="#ff6b6b" stroke-width="2"></line>
                <line x1="17" y1="9" x2="19" y2="11" stroke="#ff6b6b" stroke-width="2"></line>
                <circle cx="6.5" cy="12" r="1" fill="#ff6b6b"/>
            `;
        }
    }
}

// Countdown
function initializeCountdown() {
    const targetDate = new Date('2026-12-31T10:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        } else {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Carrusel
function initializeCarousel() {
    const track = document.getElementById('carouselTrack');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    if (!track) return;

    // calcular total dinámicamente
    const items = track.querySelectorAll('.carousel-item');
    totalSlides = items.length;
    const totalSlidesElement = document.getElementById('totalSlides');
    if (totalSlidesElement) totalSlidesElement.textContent = totalSlides;

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        });
    }

    // Ajuste inicial para asegurar cálculo correcto tras el render
    updateCarousel();
    requestAnimationFrame(updateCarousel);
    setTimeout(updateCarousel, 200);

    // Auto-play del carrusel
    setInterval(() => {
        nextSlide();
    }, 4000);
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    if (track) {
        const items = track.querySelectorAll('.carousel-item');
        if (!items.length) return;
        const container = track.parentElement;

        // Temporarily reset transform to measure actual positions
        const previousTransform = track.style.transform;
        track.style.transform = 'none';

        const firstRect = items[0].getBoundingClientRect();
        const secondRect = items[1] ? items[1].getBoundingClientRect() : null;
        const stepWidth = Math.max(1, secondRect ? Math.round(secondRect.left - firstRect.left) : Math.round(firstRect.width));

        const containerWidth = Math.round(container.getBoundingClientRect().width);
        const visibleCount = Math.max(1, Math.floor((containerWidth + 1) / stepWidth));
        const maxIndex = Math.max(0, totalSlides - visibleCount);
        if (currentSlide > maxIndex) currentSlide = 0;
        if (currentSlide < 0) currentSlide = maxIndex;

        const trackRect = track.getBoundingClientRect();
        const baseLeft = Math.round(firstRect.left - trackRect.left);
        const translateXpx = -Math.round(baseLeft + (currentSlide * stepWidth));

        // Apply transform
        track.style.transform = `translateX(${translateXpx}px)`;
        // console.log('Carousel moved to slide:', { currentSlide, visibleCount, maxIndex, translateXpx, stepWidth, baseLeft });
    }
    updateSlideCounter();
    markCenterCarouselItem();
}

function nextSlide() {
    currentSlide++;
    updateCarousel();
}

function previousSlide() {
    currentSlide--;
    updateCarousel();
}

function updateSlideCounter() {
    const currentSlideElement = document.getElementById('currentSlide');
    const totalSlidesElement = document.getElementById('totalSlides');
    if (currentSlideElement) currentSlideElement.textContent = (currentSlide + 1);
    if (totalSlidesElement) totalSlidesElement.textContent = totalSlides;
}

// Mark center carousel item on desktop
function markCenterCarouselItem() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    const items = Array.from(track.querySelectorAll('.carousel-item'));
    if (!items.length) return;
    items.forEach(it => it.classList.remove('is-center'));

    const firstItem = items[0];
    const container = track.parentElement;
    const itemWidth = firstItem.getBoundingClientRect().width;
    const containerWidth = container.getBoundingClientRect().width;
    const visibleCount = Math.max(1, Math.floor(containerWidth / itemWidth));

    const centerIndex = (currentSlide + Math.floor(visibleCount / 2)) % items.length;
    items[centerIndex].classList.add('is-center');
}

// Hook into carousel updates
const _origUpdateCarousel = typeof updateCarousel === 'function' ? updateCarousel : null;
if (_origUpdateCarousel) {
    window.updateCarousel = function() {
        _origUpdateCarousel();
        markCenterCarouselItem();
    };
}

window.addEventListener('resize', markCenterCarouselItem);

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(markCenterCarouselItem, 200);
});

// Funciones de los botones
function openLocation(location) {
    const addresses = {
        ceremony: "Parroquia Nuestra Señora de Luján, Av. Pergamino 203, Santo Domingo",
        celebration: "Salón de fiestas Avril, Av. Los Reartes 12, Santo Domingo"
    };
    
    const address = addresses[location];
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
}

function suggestMusic() {
    const whatsappMessage = "¡Hola! Me gustaría sugerir una canción para la playlist de la boda de Rafael y Juana 🎵";
    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
}

function showDressCode() {
    showToast("Dress Code", "Elegante sport - Colores tierra y dorados son bienvenidos 👗");
}

function showTips() {
    showToast("Tips y Notas", "La ceremonia será al aire libre. Se recomienda llegar 15 minutos antes ⛪");
}

function showGifts() {
    const message = "Hola, me gustaría información sobre los regalos para la boda de Rafael y Juana 🎁";
    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

function confirmAttendance() {
    const message = "¡Hola! Quiero confirmar mi asistencia a la boda de Rafael y Juana el 31 de Diciembre 💒✨";
    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Sistema de Toast
function showToast(title, message) {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toastContent');
    
    toastContent.innerHTML = `
        <h4 style="font-weight: 700; color: #fff; margin-bottom: 0.35rem; letter-spacing: 0.2px;">${title}</h4>
        <p style="color: #ddd;">${message}</p>
    `;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Nota: el efecto de portada ahora se logra 100% con CSS (hero fijo detrás
// del contenido, ver .hero-section y .content en CCSB.css), igual que en
// boda100L. Ya no hace falta mover nada por JS en el scroll.


// Forzar limpieza de caches en clientes antiguos
(function() {
  function clearCaches() {
    if ('caches' in window) {
      caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.unregister());
      }).catch(() => {});
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', clearCaches);
  } else {
    clearCaches();
  }
})();
