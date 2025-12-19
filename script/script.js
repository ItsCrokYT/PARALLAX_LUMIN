document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 0. CURSOR PERSONALIZADO (SOLO ESCRITORIO)
    // ==========================================
    const cursor = document.getElementById('cursor');
    const hoverTargets = document.querySelectorAll('.hover-target, a, button, input, textarea');
    
    // DETECCIÓN ROBUSTA: Si el dispositivo es táctil (coarse pointer), NO activamos el cursor custom.
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (!isTouchDevice && cursor) {
        // Inicialmente oculto hasta que se mueva el mouse
        cursor.style.opacity = '0';

        const moveCursor = (x, y) => {
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
        };

        document.addEventListener('mousemove', (e) => {
            cursor.style.opacity = '1';
            requestAnimationFrame(() => moveCursor(e.clientX, e.clientY));
        });

        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('active'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
        });
    }

    // =========================================================
    // 1. CONFIGURACIÓN DE GALERÍA VISUAL (CONTROL MAESTRO)
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
    // 'chaos'     : Mosaico Asimétrico Moderno
    // 'film'      : Cinta de Película Vertical (Cinemático)
    // -------------------------------------------------------------
    
    const currentGalleryMode = 'chaos'; // <-- ¡PRUEBA CAMBIANDO ESTO!

    const galleryContainer = document.getElementById('visual-gallery');
    let swiperInstance = null;

    function setGalleryMode(mode) {
        if (!galleryContainer) return;

        // 1. Limpiar TODAS las clases de modo anteriores
        galleryContainer.classList.remove(
            'mode-bento', 
            'mode-accordion', 
            'mode-hex',
            'mode-focus',
            'mode-circle',
            'mode-isometric',
            'mode-chaos',
            'mode-film',
            'mode-glitch',
            'mode-stack'
        );

        // 2. Lógica de activación
        if (mode === 'swiper') {
            // Añadir clase base necesaria para Swiper
            galleryContainer.classList.add('swiper');
            
            // Si no existe instancia, crearla
            if (!swiperInstance) {
                initSwiper();
            }
        } else {
            // Si hay una instancia de Swiper activa, destruirla para limpiar estilos inline
            if (swiperInstance) {
                swiperInstance.destroy(true, true);
                swiperInstance = null;
            }
            // IMPORTANTE: Quitar la clase 'swiper' para evitar conflictos CSS
            galleryContainer.classList.remove('swiper');
            
            // Añadir la clase del modo específico
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
                autoplay: {
                    delay: 2500,
                    disableOnInteraction: false,
                },
                observer: true,
                observeParents: true
            });
        }
    }

    // Inicializar el modo seleccionado al cargar la página
    setGalleryMode(currentGalleryMode);


    // ==========================================
    // 2. NAVEGACIÓN Y MENÚ MÓVIL
    // ==========================================
    const menuBtn = document.getElementById('menu-toggle');
    const navOverlay = document.getElementById('nav-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    const menuIcon = menuBtn ? menuBtn.querySelector('i') : null;
    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            navOverlay.classList.add('open');
            if(menuIcon) menuIcon.classList.replace('ph-list', 'ph-x');
        } else {
            navOverlay.classList.remove('open');
            if(menuIcon) menuIcon.classList.replace('ph-x', 'ph-list');
        }
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    navLinks.forEach(link => link.addEventListener('click', toggleMenu));


    // ==========================================
    // 3. ANIMACIONES HERO, SCROLL Y FIGURAS
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
            const scrollableDistance = heroHeight - windowHeight;
            
            if (scrollableDistance <= 0) return;

            const currentP = window.scrollY / scrollableDistance;
            // Puntos clave de las escenas
            const targets = [0.1, 0.28, 0.48, 0.68, 0.88, 1.05];
            
            const nextTarget = targets.find(t => t > currentP + 0.02) || targets[targets.length - 1];
            const targetScrollY = nextTarget * scrollableDistance;

            window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
        });
    }

    // Funcionalidad Botón Volver Arriba
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Funciones Helper
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

    // Loop de Animación (requestAnimationFrame)
    function animate() {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const time = performance.now() / 1000;

        // Mostrar/Ocultar botón Top
        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('visible', scrollTop > windowHeight);
        }

        // --- LÓGICA HERO (Solo si existe el contenedor) ---
        if (heroContainer) {
            const heroHeight = heroContainer.offsetHeight;
            const scrollableDistance = heroHeight - windowHeight;

            // 1. Scroll Spy (Barra lateral)
            let currentSectionId = 'inicio';
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

            navDots.forEach(dot => {
                dot.classList.remove('active');
                if (dot.getAttribute('data-target') === currentSectionId) dot.classList.add('active');
            });

            // 2. Animaciones internas del Hero
            if (scrollTop < heroHeight + 100) {
                let p = 0;
                if (scrollableDistance > 0) {
                    p = scrollTop / scrollableDistance;
                    p = Math.max(0, Math.min(1, p));
                }

                // Blobs Fondo
                if (blob1) blob1.style.transform = `translate(${Math.sin(time * 0.5) * 30 + p * 150}px, ${Math.cos(time * 0.3) * 30 + p * 80}px)`;
                if (blob2) blob2.style.transform = `translate(${Math.sin(time * 0.4 + 2) * 40 - p * 150}px, ${Math.cos(time * 0.6) * 40 - p * 150}px)`;

                // Figuras Geométricas
                shapes.forEach(shape => {
                    const autoSpeed = parseFloat(shape.dataset.autoRotate || 10);
                    const scrollSpeed = parseFloat(shape.dataset.scrollSpeed || 200);
                    const rotation = (time * autoSpeed) + (p * 360);
                    const translateY = p * -scrollSpeed;
                    const floatY = Math.sin(time * 1.5) * 10;
                    shape.style.transform = `translateY(${translateY + floatY}px) rotate(${rotation}deg)`;
                });

                // Botón Scroll Indicator (Desaparece al final)
                if (scrollBtn) {
                    let btnOp = p > 0.9 ? 1 - ((p - 0.9) / 0.1) : 1;
                    scrollBtn.style.opacity = Math.max(0, btnOp);
                    scrollBtn.style.pointerEvents = btnOp > 0.1 ? 'auto' : 'none';
                }

                // Escenas de Texto (Scrollytelling)
                // Scene 1
                let s1Op = 0;
                if (p < 0.05) s1Op = p / 0.05;
                else if (p < 0.15) s1Op = 1;
                else if (p < 0.25) s1Op = 1 - ((p - 0.15) / 0.1);
                
                if (scenes[0]) {
                    setOpacity(scenes[0], s1Op);
                    scenes[0].style.pointerEvents = s1Op > 0.1 ? "auto" : "none";
                }

                // Resto de escenas
                if (scenes[1]) setOpacity(scenes[1], calcSceneOpacity(p, 0.15, 0.28, 0.4));
                if (scenes[2]) setOpacity(scenes[2], calcSceneOpacity(p, 0.35, 0.48, 0.6));
                if (scenes[3]) setOpacity(scenes[3], calcSceneOpacity(p, 0.55, 0.68, 0.8));
                
                // Scene 5
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
    
    // Iniciar loop de animación
    animate();

    // ==========================================
    // 4. INTERSECTION OBSERVER (FADE IN GENERAL)
    // ==========================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});
