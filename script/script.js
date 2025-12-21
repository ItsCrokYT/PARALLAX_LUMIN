document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 0. CURSOR Y CONFIGURACIÓN BÁSICA
    // ==========================================
    const cursor = document.getElementById('cursor');
    const hoverTargets = document.querySelectorAll('.hover-target, a, button, input, textarea');
    // Detectar si es dispositivo táctil
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (!isTouchDevice && cursor) {
        cursor.style.opacity = '0';
        const moveCursor = (x, y) => { cursor.style.left = `${x}px`; cursor.style.top = `${y}px`; };
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.opacity = '1';
            requestAnimationFrame(() => moveCursor(e.clientX, e.clientY));
        });
        
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('active'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
        });
    }

    // ==========================================
    // 1. LIGHTBOX (VISOR DE IMÁGENES PANTALLA COMPLETA)
    // ==========================================
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxWrapper = lightboxModal ? lightboxModal.querySelector('.swiper-wrapper') : null;
    const lightboxClose = document.querySelector('.lightbox-close');
    let lightboxSwiper;

    function openLightbox(startIndex) {
        if (!lightboxWrapper) return;

        // 1. Recopilar imágenes originales
        const galleryImages = Array.from(document.querySelectorAll('#visual-gallery .gallery-card img'));
        
        // 2. Limpiar y llenar el lightbox
        lightboxWrapper.innerHTML = '';
        galleryImages.forEach(img => {
            const slide = document.createElement('div');
            slide.classList.add('swiper-slide');
            const newImg = document.createElement('img');
            newImg.src = img.src;
            slide.appendChild(newImg);
            lightboxWrapper.appendChild(slide);
        });

        // 3. Mostrar Modal
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Bloquear scroll

        // 4. Inicializar o Actualizar Swiper
        if (!lightboxSwiper) {
            if (typeof Swiper !== 'undefined') {
                lightboxSwiper = new Swiper(".lightbox-swiper", {
                    zoom: true,
                    navigation: {
                        nextEl: ".lightbox-swiper .swiper-button-next",
                        prevEl: ".lightbox-swiper .swiper-button-prev",
                    },
                    pagination: {
                        el: ".lightbox-swiper .swiper-pagination",
                        type: "fraction",
                    },
                    keyboard: { enabled: true },
                    initialSlide: startIndex,
                });
            }
        } else {
            lightboxSwiper.update();
            lightboxSwiper.slideTo(startIndex, 0);
        }
    }

    function closeLightbox() {
        if (lightboxModal) {
            lightboxModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Event Delegation para abrir lightbox desde cualquier galería
    const galleryContainerRef = document.getElementById('visual-gallery');
    if (galleryContainerRef) {
        galleryContainerRef.addEventListener('click', (e) => {
            const card = e.target.closest('.gallery-card');
            if (card) {
                // Calcular índice real
                const allCards = Array.from(galleryContainerRef.querySelectorAll('.gallery-card'));
                let index = allCards.indexOf(card);
                
                // Ajuste si estamos en modo Swiper (Loop duplica slides)
                if (card.hasAttribute('data-swiper-slide-index')) {
                    index = parseInt(card.getAttribute('data-swiper-slide-index'));
                } else if (swiperInstance && swiperInstance.realIndex !== undefined) {
                     // Si clicamos el slide activo en modo loop
                     if (card.classList.contains('swiper-slide-active')) {
                        index = swiperInstance.realIndex;
                     }
                }
                openLightbox(index);
            }
        });
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) closeLightbox();
    });


    // =========================================================
    // 2. CONFIGURACIÓN DE GALERÍA VISUAL (CONTROL MAESTRO)
    // =========================================================
    
    // -------------------------------------------------------------
    // ¡CAMBIA ESTA VARIABLE PARA ELEGIR LA GALERÍA ACTIVA!
    //
    // Opciones disponibles:
    // 'swiper'    : Slider 3D Interactivo (Por defecto)
    // 'bento'     : Grid Asimétrico (Estilo Dashboard)
    // 'accordion' : Acordeón Horizontal Expansivo
    // 'hex'       : Panal de Abejas (Hexagonal)
    // 'focus'     : Focus Grid (Modo Moderno)
    // 'circle'    : Esferas que revelan cuadrados
    // 'isometric' : Perspectiva Isométrica 3D
    // 'chaos'     : Mosaico Asimétrico Moderno (Tetris)
    // 'film'      : Cinta de Película Vertical (Cinemático)
    // -------------------------------------------------------------
    
    const currentGalleryMode = 'chaos'; // <-- ¡PRUEBA CAMBIANDO ESTO!

    const galleryContainer = document.getElementById('visual-gallery');
    let swiperInstance = null;

    function setGalleryMode(mode) {
        if (!galleryContainer) return;

        // 1. Limpiar TODAS las clases de modo anteriores
        galleryContainer.classList.remove(
            'mode-bento', 'mode-accordion', 'mode-hex', 'mode-focus',
            'mode-circle', 'mode-isometric', 'mode-chaos', 'mode-film',
            'mode-glitch', 'mode-stack'
        );

        // 2. Lógica de activación
        if (mode === 'swiper') {
            galleryContainer.classList.add('swiper');
            if (!swiperInstance) initSwiper();
        } else {
            if (swiperInstance) {
                swiperInstance.destroy(true, true);
                swiperInstance = null;
            }
            // Quitar clase swiper para no interferir con CSS Grid/Flex
            galleryContainer.classList.remove('swiper');
            // Añadir clase del modo específico
            galleryContainer.classList.add(`mode-${mode}`);
        }
    }

    function initSwiper() {
        if (typeof Swiper !== 'undefined') {
            swiperInstance = new Swiper("#visual-gallery", {
                effect: "coverflow",
                grabCursor: true,
                centeredSlides: true,
                slidesPerView: "auto",
                coverflowEffect: {
                    rotate: 50,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: true,
                },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                },
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
                loop: true,
                autoplay: { delay: 2500, disableOnInteraction: false },
                observer: true,
                observeParents: true
            });
        }
    }

    setGalleryMode(currentGalleryMode);


    // ==========================================
    // 3. NAVEGACIÓN Y MENÚ MÓVIL
    // ==========================================
    const menuBtn = document.getElementById('menu-toggle');
    const navOverlay = document.getElementById('nav-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    const menuIcon = menuBtn ? menuBtn.querySelector('i') : null;
    
    function toggleMenu() {
        if (navOverlay.classList.contains('open')) {
            navOverlay.classList.remove('open');
            if(menuIcon) menuIcon.classList.replace('ph-x', 'ph-list');
        } else {
            navOverlay.classList.add('open');
            if(menuIcon) menuIcon.classList.replace('ph-list', 'ph-x');
        }
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    navLinks.forEach(link => link.addEventListener('click', toggleMenu));


    // ==========================================
    // 4. ANIMACIONES HERO, SCROLL Y FIGURAS
    // ==========================================
    const heroContainer = document.querySelector('.hero-scroll-container');
    const scenes = document.querySelectorAll('.hero-scene'); 
    const blob1 = document.querySelector('.blob-1');
    const blob2 = document.querySelector('.blob-2');
    const shapes = document.querySelectorAll('.shape');
    const scrollBtn = document.getElementById('scroll-start-btn');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const navDots = document.querySelectorAll('.nav-dot');
    const sections = ['inicio', 'intro', 'servicios', 'portafolio', 'galeria', 'contacto'];

    // Funcionalidad Botón Scroll Hero
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            if (!heroContainer) return;
            const heroHeight = heroContainer.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollable = heroHeight - windowHeight;
            if(scrollable <= 0) return;
            const currentP = window.scrollY / scrollable;
            const targets = [0.1, 0.28, 0.48, 0.68, 0.88, 1.05];
            const nextTarget = targets.find(t => t > currentP + 0.02) || targets[targets.length - 1];
            window.scrollTo({ top: nextTarget * scrollable, behavior: 'smooth' });
        });
    }

    // Funcionalidad Botón Volver Arriba
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    function setOpacity(element, opacity) {
        if (!element) return;
        element.style.opacity = Math.max(0, Math.min(1, opacity));
        const scale = 0.8 + (opacity * 0.2); 
        element.style.transform = `scale(${scale})`;
    }

    function calcSceneOpacity(progress, start, peak, end) {
        if (progress < start || progress > end) return 0;
        if (progress < peak) return (progress - start) / (peak - start);
        return 1 - (progress - peak) / (end - peak);
    }

    function animate() {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const time = performance.now() / 1000;

        if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', scrollTop > windowHeight);

        // Scroll Spy (Barra lateral)
        let currentSectionId = 'inicio';
        if (heroContainer) {
            const heroHeight = heroContainer.offsetHeight;
            if (scrollTop < heroHeight - windowHeight / 2) {
                currentSectionId = 'inicio';
            } else {
                sections.slice(1).forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section) {
                        const rect = section.getBoundingClientRect();
                        if (rect.top <= windowHeight / 1.5 && rect.bottom >= windowHeight / 3) {
                            currentSectionId = sectionId;
                        }
                    }
                });
            }
        }
        navDots.forEach(dot => {
            dot.classList.remove('active');
            if (dot.getAttribute('data-target') === currentSectionId) dot.classList.add('active');
        });

        // Animaciones dentro del Hero
        if (heroContainer) {
            const heroHeight = heroContainer.offsetHeight;
            if (scrollTop < heroHeight + 100) {
                const scrollable = heroHeight - windowHeight;
                let p = scrollable > 0 ? Math.max(0, Math.min(1, scrollTop / scrollable)) : 0;

                if (blob1) blob1.style.transform = `translate(${Math.sin(time * 0.5) * 30 + p * 150}px, ${Math.cos(time * 0.3) * 30 + p * 80}px)`;
                if (blob2) blob2.style.transform = `translate(${Math.sin(time * 0.4 + 2) * 40 - p * 150}px, ${Math.cos(time * 0.6) * 40 - p * 150}px)`;

                shapes.forEach(shape => {
                    const autoSpeed = parseFloat(shape.dataset.autoRotate || 10);
                    const scrollSpeed = parseFloat(shape.dataset.scrollSpeed || 200);
                    const rotation = (time * autoSpeed) + (p * 360);
                    const translateY = p * -scrollSpeed;
                    const floatY = Math.sin(time * 1.5) * 10;
                    shape.style.transform = `translateY(${translateY + floatY}px) rotate(${rotation}deg)`;
                });

                if (scrollBtn) {
                    let btnOp = p > 0.9 ? 1 - ((p - 0.9) / 0.1) : 1;
                    scrollBtn.style.opacity = Math.max(0, btnOp);
                    scrollBtn.style.pointerEvents = btnOp > 0.1 ? 'auto' : 'none';
                }

                // Scenes
                let s1Op = 0;
                if (p < 0.05) s1Op = p / 0.05;
                else if (p < 0.15) s1Op = 1;
                else if (p < 0.25) s1Op = 1 - ((p - 0.15) / 0.1);
                
                if(scenes[0]) {
                    setOpacity(scenes[0], s1Op);
                    scenes[0].style.pointerEvents = s1Op > 0.1 ? "auto" : "none";
                }

                if (scenes[1]) setOpacity(scenes[1], calcSceneOpacity(p, 0.15, 0.28, 0.4));
                if (scenes[2]) setOpacity(scenes[2], calcSceneOpacity(p, 0.35, 0.48, 0.6));
                if (scenes[3]) setOpacity(scenes[3], calcSceneOpacity(p, 0.55, 0.68, 0.8));
                
                let s5Op = 0;
                if (p > 0.75) {
                    s5Op = (p - 0.75) / 0.15;
                    if (p > 0.95) s5Op = 1 - ((p - 0.95) / 0.05);
                }
                if (scenes[4]) setOpacity(scenes[4], s5Op);
            }
        }
        requestAnimationFrame(animate);
    }
    animate();

    // ==========================================
    // 5. INTERSECTION OBSERVER (FADE IN GENERAL)
    // ==========================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});
