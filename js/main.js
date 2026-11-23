/**
 * Belestetik - Sitio Web de Estética Profesional
 * Lógica de interacción, menú móvil y configuración de WhatsApp.
 */

// CONFIGURACIÓN DE CONTACTO (Fácilmente modificable)
const WHATSAPP_CONFIG = {
    // Ingresa el número de WhatsApp con código de país, sin '+' ni espacios
    // Ejemplo: '5491130000000' (Argentina) o '34600000000' (España)
    phone: "5493872110233",
    
    // Mensaje predeterminado que se enviará al hacer clic en el botón de entradas
    message: "Hola Belestetik, me gustaría recibir información sobre el evento Belestetik Internacional 2026 y consultar por la compra de entradas."
};

document.addEventListener('DOMContentLoaded', () => {

    // Limpieza automática preventiva de fotos pesadas base64 en localStorage (ahora usamos archivos en assets/)
    try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('speaker_photo_') || k.startsWith('speaker_gallery_'))) {
                keysToRemove.push(k);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch(e) {}

    // Helper function to compress images before saving them to localStorage
    const compressImage = (base64Str, maxWidth, maxHeight, quality, callback) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            callback(compressedBase64);
        };
        img.onerror = () => {
            callback(base64Str);
        };
    };

    // --- 1. MENÚ DE NAVEGACIÓN MÓVIL (HAMBURGUESA) ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinksContainer = document.getElementById('nav-links-container');

    if (mobileMenuBtn && navLinksContainer) {
        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            navLinksContainer.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace en móvil
        const navLinks = navLinksContainer.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navLinksContainer.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // --- 2. CONFIGURACIÓN DINÁMICA DE ENLACES DE WHATSAPP ---
    const whatsappButtons = document.querySelectorAll('.whatsapp-action');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Construir enlace wa.me
            const encodedText = encodeURIComponent(WHATSAPP_CONFIG.message);
            const whatsappUrl = `https://wa.me/${WHATSAPP_CONFIG.phone}?text=${encodedText}`;
            
            // Abrir en una pestaña nueva
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        });
    });

    // --- 3. MENÚ INTERNO DE BELESTETIK (SCROLL SPY & SMOOTH SCROLL) ---
    const eventNavLinks = document.querySelectorAll('.event-subnav-link');
    const eventSections = document.querySelectorAll('.event-section');

    if (eventNavLinks.length > 0 && eventSections.length > 0) {
        // Desplazamiento suave para los enlaces del menú interno
        eventNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerOffset = 130; // Altura acumulada de cabeceras sticky
                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Actualizar clase activa manualmente inmediatamente
                    eventNavLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });

        // Resaltado dinámico al hacer scroll (Scroll Spy)
        const handleScrollSpy = () => {
            let currentActiveId = '';
            const scrollPosition = window.scrollY + 160; // offset de tolerancia

            eventSections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    currentActiveId = `#${section.getAttribute('id')}`;
                }
            });

            // Si estamos muy cerca del final de la página, marcar el último elemento (Precios)
            if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 60) {
                currentActiveId = '#precios';
            }

            if (currentActiveId) {
                eventNavLinks.forEach(link => {
                    if (link.getAttribute('href') === currentActiveId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        };

        window.addEventListener('scroll', handleScrollSpy);
        // Ejecutar una vez al inicio por si ya hay scroll
        handleScrollSpy();
    }

    // --- 4. ANIMACIONES AL HACER SCROLL (INTERSECTION OBSERVER) ---
    const animateOnScrollElements = document.querySelectorAll('.reveal');
    
    if ('IntersectionObserver' in window && animateOnScrollElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Dejar de observar una vez animado
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animateOnScrollElements.forEach(el => {
            revealObserver.observe(el);
        });
    } else {
        // Fallback en caso de que no soporte IntersectionObserver
        animateOnScrollElements.forEach(el => {
            el.classList.add('active');
        });
    }

    // --- 5. LÓGICA DE SUBIDA MANUAL DE FOTOS DE DISERTANTES (PERSISTENCIA LOCAL) ---
    const fileInput = document.getElementById('speaker-photo-file-input');
    let activeSpeakerId = null;

    // Cargar fotos guardadas en localStorage al iniciar la página
    const loadPersistedPhotos = () => {
        // Las fotos ahora son archivos físicos fijos en assets/, ya no dependen de base64
        return;
        const images = document.querySelectorAll('img[data-speaker-id]');
        images.forEach(img => {
            const speakerId = img.getAttribute('data-speaker-id');
            let savedPhoto = localStorage.getItem('speaker_photo_' + speakerId);

            if (savedPhoto && savedPhoto !== 'null' && savedPhoto !== 'undefined' && savedPhoto.trim() === 'undefined') {
                savedPhoto = null;
            }

            if (savedPhoto && savedPhoto !== 'null' && savedPhoto !== 'undefined' && savedPhoto.trim() !== '') {
                img.src = savedPhoto;
            } else if (savedPhoto !== null) {
                localStorage.removeItem('speaker_photo_' + speakerId);
            }
        });
    };

    // Escuchar clicks en los botones de subir foto (+)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.upload-photo-btn');
        if (btn && btn.id !== 'change-intro-video-btn') {
            e.preventDefault();
            e.stopPropagation();
            activeSpeakerId = btn.getAttribute('data-speaker-id');
            if (fileInput) {
                fileInput.click();
            }
        }
    });

    // Escuchar el cambio en el selector de archivos
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && activeSpeakerId) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const rawBase64 = event.target.result;
                    
                    // Compress image to max 800px width/height, 0.75 quality (sizes down from ~2MB to ~40KB)
                    compressImage(rawBase64, 800, 800, 0.75, (compressedBase64) => {
                        // 1. Actualizar todas las imágenes con este speakerId en la página
                        const imgEls = document.querySelectorAll(`img[data-speaker-id="${activeSpeakerId}"]`);
                        imgEls.forEach(img => {
                            img.src = compressedBase64;
                        });
                        
                        // 2. Guardar en localStorage para persistencia
                        localStorage.setItem('speaker_photo_' + activeSpeakerId, compressedBase64);
                        
                        // 3. Sincronizar con el primer elemento de la galería si existe
                        const syncGallery = (spId) => {
                            const savedGallery = localStorage.getItem('speaker_gallery_' + spId);
                            if (savedGallery) {
                                try {
                                    const galleryItems = JSON.parse(savedGallery);
                                    if (galleryItems.length > 0) {
                                        if (typeof galleryItems[0] === 'string') {
                                            galleryItems[0] = compressedBase64;
                                        } else if (galleryItems[0] && typeof galleryItems[0] === 'object') {
                                            galleryItems[0].src = compressedBase64;
                                            galleryItems[0].type = 'image';
                                        }
                                        localStorage.setItem('speaker_gallery_' + spId, JSON.stringify(galleryItems));
                                    }
                                } catch (e) {
                                    console.error('Error al sincronizar foto de perfil con la galería', e);
                                }
                            }
                        };
                        syncGallery(activeSpeakerId);

                        // 4. Re-inicializar los sliders
                        initSpeakerCarousels();
                    });
                    
                    // Limpiar input para permitir subir el mismo archivo después
                    fileInput.value = '';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Ejecutar carga al inicio
    loadPersistedPhotos();

    // --- 6. LÓGICA DE GALERÍA MODAL Y SUBIDA DE IMÁGENES MULTIPLES (CON SOPORTE DE VIDEOS) ---
    const galleryModal = document.getElementById('gallery-modal');
    const modalSpeakerName = document.getElementById('modal-speaker-name');
    const modalGalleryItems = document.getElementById('modal-gallery-items');
    const galleryFileInput = document.getElementById('gallery-photo-file-input');
    const addGalleryImgBtn = document.getElementById('add-gallery-img-btn');
    const addGalleryVideoBtn = document.getElementById('add-gallery-video-btn');
    const videoUrlForm = document.getElementById('video-url-form');
    const videoUrlInput = document.getElementById('video-url-input');
    const saveVideoUrlBtn = document.getElementById('save-video-url-btn');
    const cancelVideoUrlBtn = document.getElementById('cancel-video-url-btn');
    const closeModalBtn = document.querySelector('.close-modal');
    let activeGallerySpeakerId = null;

    // Utilidades para videos de YouTube
    const isYouTubeUrl = (url) => {
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getYouTubeEmbedUrl = (url) => {
        let videoId = '';
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
        } else if (url.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            videoId = urlParams.get('v');
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('youtube.com/embed/')[1].split(/[?#]/)[0];
        }
        return `https://www.youtube.com/embed/${videoId}`;
    };

    const resetVideoForm = () => {
        if (videoUrlForm) videoUrlForm.style.display = 'none';
        if (videoUrlInput) videoUrlInput.value = '';
    };

    // Renderizar la galería (soporta imágenes y videos)
    const renderGallery = (speakerId) => {
        if (!modalGalleryItems) return;
        modalGalleryItems.innerHTML = '';
        
        let galleryItems = [];
        if (window.DUAL_SPEAKERS && window.DUAL_SPEAKERS[speakerId]) {
            galleryItems = window.DUAL_SPEAKERS[speakerId].map(src => ({ type: 'image', src: src }));
        }
        let savedGallery = galleryItems.length > 0 ? null : localStorage.getItem('speaker_gallery_' + speakerId);
        if (!savedGallery || savedGallery === 'null' || savedGallery === 'undefined') {
            const baseSpeakerId = speakerId.replace('-disertante', '');
            const relatedSpeakerId = speakerId.endsWith('-disertante') ? baseSpeakerId : `${baseSpeakerId}-disertante`;
            const relatedGallery = localStorage.getItem('speaker_gallery_' + relatedSpeakerId);
            if (relatedGallery && relatedGallery !== 'null' && relatedGallery !== 'undefined') {
                savedGallery = relatedGallery;
            }
        }
        
        if (savedGallery && savedGallery !== 'null' && savedGallery !== 'undefined') {
            galleryItems = JSON.parse(savedGallery);
        } else {
            // Valores por defecto (mockups): foto del disertante, masterclass y fondo hero
            const mainImg = document.querySelector(`img[data-speaker-id="${speakerId}"]`);
            const mainSrc = mainImg ? mainImg.getAttribute('src') : 'assets/logo2.png';
            galleryItems = [
                { type: 'image', src: mainSrc },
                { type: 'image', src: 'assets/logo2.png' }
            ];
        }
        
        // Crear elementos de imagen y video
        galleryItems.forEach((item, index) => {
            // Normalizar datos antiguos (que eran strings simples)
            const itemObj = (typeof item === 'string') ? { type: 'image', src: item } : item;
            
            const element = document.createElement('div');
            element.className = 'gallery-item';
            
            if (itemObj.type === 'video') {
                element.classList.add('video-item');
                if (isYouTubeUrl(itemObj.src)) {
                    const embedUrl = getYouTubeEmbedUrl(itemObj.src);
                    element.innerHTML = `
                        <iframe src="${embedUrl}" frameborder="0" allowfullscreen style="width: 100%; height: 100%; border: none;"></iframe>
                        
                    `;
                } else {
                    element.innerHTML = `
                        <video src="${itemObj.src}" controls style="width: 100%; height: 100%; object-fit: cover; background-color: #000;"></video>
                        
                    `;
                }
            } else {
                element.innerHTML = `
                    <img src="${itemObj.src}" alt="Imagen ${index + 1}">
                    
                `;
            }
            modalGalleryItems.appendChild(element);
        });
    };

    // Abrir Modal
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.open-gallery-btn');
        if (btn) {
            e.preventDefault();
            activeGallerySpeakerId = btn.getAttribute('data-speaker-id');
            const card = btn.closest('.speaker-card');
            const speakerNameText = card ? card.querySelector('.speaker-name').textContent : 'Disertante';
            
            if (galleryModal && modalSpeakerName) {
                modalSpeakerName.textContent = `Galería de ${speakerNameText}`;
                resetVideoForm();
                renderGallery(activeGallerySpeakerId);
                galleryModal.classList.add('active');
            }
        }
    });

    // Cerrar Modal
    if (closeModalBtn && galleryModal) {
        closeModalBtn.addEventListener('click', () => {
            galleryModal.classList.remove('active');
            resetVideoForm();
        });
        
        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) {
                galleryModal.classList.remove('active');
                resetVideoForm();
            }
        });
    }

    // Activar selector de archivos de imagen en el modal
    if (addGalleryImgBtn && galleryFileInput) {
        addGalleryImgBtn.addEventListener('click', () => {
            galleryFileInput.click();
        });
    }

    // Activar formulario de video
    if (addGalleryVideoBtn && videoUrlForm) {
        addGalleryVideoBtn.addEventListener('click', () => {
            videoUrlForm.style.display = videoUrlForm.style.display === 'none' ? 'block' : 'none';
            if (videoUrlForm.style.display === 'block' && videoUrlInput) {
                videoUrlInput.focus();
            }
        });
    }

    // Cancelar agregar video
    if (cancelVideoUrlBtn) {
        cancelVideoUrlBtn.addEventListener('click', () => {
            resetVideoForm();
        });
    }

    // Guardar enlace de video
    if (saveVideoUrlBtn && videoUrlInput) {
        saveVideoUrlBtn.addEventListener('click', () => {
            const urlVal = videoUrlInput.value.trim();
            if (!urlVal || !activeGallerySpeakerId) return;

            let galleryItems = [];
            const savedGallery = localStorage.getItem('speaker_gallery_' + activeGallerySpeakerId);
            if (savedGallery) {
                galleryItems = JSON.parse(savedGallery);
            } else {
                const mainImg = document.querySelector(`img[data-speaker-id="${activeGallerySpeakerId}"]`);
                const mainSrc = mainImg ? mainImg.src : 'assets/masterclass.png';
                galleryItems = [
                    { type: 'image', src: mainSrc },
                    { type: 'image', src: 'assets/masterclass.png' },
                    { type: 'image', src: 'assets/hero-bg.png' }
                ];
            }

            // Agregar el nuevo item de video
            galleryItems.push({ type: 'video', src: urlVal });
            
            localStorage.setItem('speaker_gallery_' + activeGallerySpeakerId, JSON.stringify(galleryItems));

            // Refrescar y limpiar
            renderGallery(activeGallerySpeakerId);
            initSpeakerCarousels();
            resetVideoForm();
        });
    }

    // Procesar subida de imágenes a la galería
    if (galleryFileInput) {
        galleryFileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0 || !activeGallerySpeakerId) return;
            
            let loadedCount = 0;
            const newImages = [];
            
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const rawBase64 = event.target.result;
                    
                    // Compress image to max 1000px width/height, 0.75 quality (sizes down to ~50KB)
                    compressImage(rawBase64, 1000, 1000, 0.75, (compressedBase64) => {
                        newImages.push({ type: 'image', src: compressedBase64 });
                        loadedCount++;
                        
                        if (loadedCount === files.length) {
                            let galleryItems = [];
                            const savedGallery = localStorage.getItem('speaker_gallery_' + activeGallerySpeakerId);
                            if (savedGallery) {
                                galleryItems = JSON.parse(savedGallery);
                            } else {
                                const mainImg = document.querySelector(`img[data-speaker-id="${activeGallerySpeakerId}"]`);
                                const mainSrc = mainImg ? mainImg.src : 'assets/masterclass.png';
                                galleryItems = [
                                    { type: 'image', src: mainSrc },
                                    { type: 'image', src: 'assets/masterclass.png' },
                                    { type: 'image', src: 'assets/hero-bg.png' }
                                ];
                            }
                            
                            // Añadir imágenes nuevas y guardar
                            galleryItems = galleryItems.concat(newImages);
                            
                            localStorage.setItem('speaker_gallery_' + activeGallerySpeakerId, JSON.stringify(galleryItems));
                            
                            // Refrescar
                            renderGallery(activeGallerySpeakerId);
                            initSpeakerCarousels();
                            galleryFileInput.value = '';
                        }
                    });
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Eliminar foto o video de la galería
    if (modalGalleryItems) {
        modalGalleryItems.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-gallery-item');
            if (deleteBtn && activeGallerySpeakerId) {
                const indexToRemove = parseInt(deleteBtn.getAttribute('data-index'), 10);
                
                let galleryItems = [];
                const savedGallery = localStorage.getItem('speaker_gallery_' + activeGallerySpeakerId);
                if (savedGallery) {
                    galleryItems = JSON.parse(savedGallery);
                } else {
                    const mainImg = document.querySelector(`img[data-speaker-id="${activeGallerySpeakerId}"]`);
                    const mainSrc = mainImg ? mainImg.src : 'assets/masterclass.png';
                    galleryItems = [
                        { type: 'image', src: mainSrc },
                        { type: 'image', src: 'assets/masterclass.png' },
                        { type: 'image', src: 'assets/hero-bg.png' }
                    ];
                }
                
                galleryItems.splice(indexToRemove, 1);
                
                localStorage.setItem('speaker_gallery_' + activeGallerySpeakerId, JSON.stringify(galleryItems));
                
                renderGallery(activeGallerySpeakerId);
                initSpeakerCarousels();
            }
        });
    }

    // --- 7. LÓGICA PARA EL VIDEO DE PRESENTACIÓN (HERO SECTION) ---
    const introVideoContainer = document.getElementById('intro-video-container');
    const introVideoModal = document.getElementById('intro-video-modal');
    const closeIntroVideoModalBtn = document.getElementById('close-intro-video-modal');
    const introVideoUrlInput = document.getElementById('intro-video-url-input');
    const uploadLocalVideoBtn = document.getElementById('upload-local-video-btn');
    const introVideoFileInput = document.getElementById('intro-video-file-input');
    const saveIntroVideoBtn = document.getElementById('save-intro-video-btn');
    const cancelIntroVideoBtn = document.getElementById('cancel-intro-video-btn');
    const clearIntroVideoBtn = document.getElementById('clear-intro-video-btn');

    // Capturar la URL del video original declarada en el HTML antes de limpiar
    const originalVideoEl = document.getElementById('intro-video');
    const defaultVideoUrl = originalVideoEl ? 
        (originalVideoEl.querySelector('source') ? originalVideoEl.querySelector('source').getAttribute('src') : (originalVideoEl.getAttribute('src') || '')) : 
        "https://assets.mixkit.co/videos/preview/mixkit-woman-receiving-a-facial-massage-in-a-spa-41578-large.mp4";

    // Función para renderizar el video/iframe según la URL guardada
    const updateIntroVideo = () => {
        if (!introVideoContainer) return;
        
        const savedVideo = localStorage.getItem('belestetik_intro_video');
        const videoSrc = savedVideo || defaultVideoUrl;
        
        // Limpiar contenedor
        introVideoContainer.innerHTML = '';
        
        let mediaElement;
        if (isYouTubeUrl(videoSrc)) {
            const embedUrl = getYouTubeEmbedUrl(videoSrc);
            mediaElement = document.createElement('iframe');
            mediaElement.src = embedUrl;
            mediaElement.frameBorder = '0';
            mediaElement.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            mediaElement.allowFullscreen = true;
        } else {
            mediaElement = document.createElement('video');
            mediaElement.controls = true;
            mediaElement.autoplay = true;
            mediaElement.muted = true;
            mediaElement.loop = true;
            mediaElement.playsInline = true;
            mediaElement.src = videoSrc;
            mediaElement.load(); // Force loading of the new source
        }
        
        mediaElement.id = 'intro-video';
        mediaElement.className = 'intro-image';
        mediaElement.style.objectFit = 'contain';
        mediaElement.style.backgroundColor = '#072C26';
        introVideoContainer.appendChild(mediaElement);
        
        // Re-crear y añadir el botón +
        // Botón + removido
    };

    // Escuchar click en el botón + para cambiar video usando delegación de eventos
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#change-intro-video-btn');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            
            const savedVideo = localStorage.getItem('belestetik_intro_video') || '';
            if (introVideoUrlInput) {
                introVideoUrlInput.value = savedVideo;
            }
            if (introVideoModal) {
                introVideoModal.classList.add('active');
            }
        }
    });

    // Cerrar Modal
    const closeIntroVideoModal = () => {
        if (introVideoModal) introVideoModal.classList.remove('active');
        if (introVideoFileInput) introVideoFileInput.value = '';
    };

    if (closeIntroVideoModalBtn) {
        closeIntroVideoModalBtn.addEventListener('click', closeIntroVideoModal);
    }
    if (cancelIntroVideoBtn) {
        cancelIntroVideoBtn.addEventListener('click', closeIntroVideoModal);
    }
    if (introVideoModal) {
        introVideoModal.addEventListener('click', (e) => {
            if (e.target === introVideoModal) {
                closeIntroVideoModal();
            }
        });
    }

    // Activar selector de archivo local
    if (uploadLocalVideoBtn && introVideoFileInput) {
        uploadLocalVideoBtn.addEventListener('click', () => {
            introVideoFileInput.click();
        });
    }

    // Procesar subida de archivo local
    if (introVideoFileInput) {
        introVideoFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 4 * 1024 * 1024) {
                alert("El archivo es demasiado grande para guardarse en la memoria persistente del navegador (>4MB). Se creará una vista previa temporal. Para que quede fijo al recargar, por favor coloca el archivo en tu carpeta 'assets/' y escribe su ruta 'assets/" + file.name + "' en la caja de texto.");
                const objectUrl = URL.createObjectURL(file);
                if (introVideoUrlInput) {
                    introVideoUrlInput.value = objectUrl;
                }
            } else {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (introVideoUrlInput) {
                        introVideoUrlInput.value = event.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Guardar cambios del video de presentación
    if (saveIntroVideoBtn && introVideoUrlInput) {
        saveIntroVideoBtn.addEventListener('click', () => {
            const urlVal = introVideoUrlInput.value.trim();
            if (urlVal) {
                localStorage.setItem('belestetik_intro_video', urlVal);
            } else {
                localStorage.removeItem('belestetik_intro_video');
            }
            updateIntroVideo();
            closeIntroVideoModal();
        });
    }

    // Restaurar video por defecto
    if (clearIntroVideoBtn) {
        clearIntroVideoBtn.addEventListener('click', () => {
            localStorage.removeItem('belestetik_intro_video');
            updateIntroVideo();
            closeIntroVideoModal();
        });
    }

    // Función global para exportar las fotos subidas y el video en un archivo JSON
    window.exportSpeakerData = () => {
        const data = {
            photos: {},
            videoUrl: localStorage.getItem('belestetik_intro_video') || ''
        };
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('speaker_photo_horario-')) {
                const speakerId = key.replace('speaker_photo_', '');
                data.photos[speakerId] = localStorage.getItem(key);
            }
        }
        
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'speaker_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Se ha descargado el archivo "speaker_data.json" en tu carpeta de Descargas.\n\nPor favor, muévelo/cópialo a la carpeta de tu proyecto ("Pagina informativa") y avísame aquí en el chat para guardar las fotos permanentemente en la carpeta de la web.');
    };

    window.clearPhotoCache = () => {
        let count = 0;
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('speaker_photo_horario-')) {
                localStorage.removeItem(key);
                count++;
            }
        }
        alert('¡Memoria temporal liberada! Se limpiaron ' + count + ' fotos del navegador. Ya puedes seguir subiendo el resto de tus fotos.');
        window.location.reload();
    };

    // --- 8. CAROUSEL DE FOTOS TIPO INSTAGRAM PARA DISERTANTES ---
    
    const DUAL_SPEAKERS_PHOTOS = {
        'marcela-alejandra-disertante': [
            'assets/speaker-marcela-miguenz.jpg',
            'assets/speaker-alejandra-cruz.jpg'
        ],
        'cristina-rodrigo-disertante': [
            'assets/speaker-cristina-moro.jpg',
            'assets/speaker-rodrigo-garcia.jpg'
        ],
        'roberto-daniela-disertante': [
            'assets/speaker-roberto-angeloff.jpg',
            'assets/speaker-daniela-goette.jpg'
        ]
    };

    const initSpeakerCarousels = () => {
        const cards = document.querySelectorAll('.speaker-card');
        cards.forEach(card => {
            const imgContainer = card.querySelector('.speaker-image-container');
            if (!imgContainer) return;
            
            const imgEl = imgContainer.querySelector('.speaker-image');
            if (!imgEl) return;
            
            const speakerId = imgEl.getAttribute('data-speaker-id');
            if (!speakerId) return;

            // Eliminar elementos del slider anteriores para evitar duplicados
            const oldPrev = imgContainer.querySelector('.speaker-slider-prev');
            const oldNext = imgContainer.querySelector('.speaker-slider-next');
            const oldDots = imgContainer.querySelector('.speaker-slider-dots');
            if (oldPrev) oldPrev.remove();
            if (oldNext) oldNext.remove();
            if (oldDots) oldDots.remove();

            let images = [];

            // 1. Si es una dupla, cargar SIEMPRE sus 2 fotos reales
            if (DUAL_SPEAKERS_PHOTOS[speakerId]) {
                images = [...DUAL_SPEAKERS_PHOTOS[speakerId]];
            } else {
                // Para los demás, su foto fija
                const defaultSrc = imgEl.getAttribute('src') || '';
                if (defaultSrc) images = [defaultSrc];
            }

            // Si hay 1 o menos imágenes, no hay nada que desplazar
            if (images.length <= 1) return;

            let currentIndex = 0;

            // Crear botón anterior
            const prevBtn = document.createElement('button');
            prevBtn.className = 'speaker-slider-btn speaker-slider-prev';
            prevBtn.innerHTML = '&#10094;';
            prevBtn.title = 'Imagen anterior';
            
            // Crear botón siguiente
            const nextBtn = document.createElement('button');
            nextBtn.className = 'speaker-slider-btn speaker-slider-next';
            nextBtn.innerHTML = '&#10095;';
            nextBtn.title = 'Siguiente imagen';

            // Crear contenedor de puntitos (dots)
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'speaker-slider-dots';

            images.forEach((_, idx) => {
                const dot = document.createElement('div');
                dot.className = 'speaker-slider-dot' + (idx === 0 ? ' active' : '');
                dotsContainer.appendChild(dot);
            });

            // Función para actualizar la imagen y el estado del slider
            const updateSlider = (newIndex) => {
                imgEl.style.transition = 'opacity 0.2s ease';
                imgEl.style.opacity = 0.2;
                
                setTimeout(() => {
                    currentIndex = newIndex;
                    imgEl.src = images[currentIndex];
                    
                    const dots = dotsContainer.querySelectorAll('.speaker-slider-dot');
                    dots.forEach((dot, idx) => {
                        dot.classList.toggle('active', idx === currentIndex);
                    });
                    
                    imgEl.style.opacity = 1;
                }, 150);
            };

            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                let newIndex = currentIndex - 1;
                if (newIndex < 0) {
                    newIndex = images.length - 1;
                }
                updateSlider(newIndex);
            });

            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                let newIndex = currentIndex + 1;
                if (newIndex >= images.length) {
                    newIndex = 0;
                }
                updateSlider(newIndex);
            });

            imgContainer.appendChild(prevBtn);
            imgContainer.appendChild(nextBtn);
            imgContainer.appendChild(dotsContainer);
            
            // Establecer la primera foto fija
            imgEl.src = images[0];
        });
    };

    // Inicializar carousels de disertantes
    initSpeakerCarousels();

    // Inicializar video al cargar la página
    updateIntroVideo();
});
