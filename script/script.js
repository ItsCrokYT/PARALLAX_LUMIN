document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 0. CURSOR (Solo Desktop) - Código intacto
    // ==========================================
    const cursor = document.getElementById('cursor');
    const hoverTargets = document.querySelectorAll('.hover-target, a, button, input, textarea');
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

    // =========================================================
    // 1. CONFIGURACIÓN DE GALERÍA VISUAL (CONTROL MAESTRO)
    // =========================================================
    
    // Cambia a 'film' para probar el nuevo carrusel
    const currentGalleryMode = 'film'; 

    const galleryContainer = document.getElementById('visual-gallery');
    let swiperInstance = null;

    function setGalleryMode(mode) {
        if (!galleryContainer) return;

        // 1. Limpiar clases de modo
        galleryContainer.classList.remove(
            'mode-bento', 'mode-accordion', 'mode-hex', 'mode-focus',
            'mode-circle', 'mode-isometric', 'mode-chaos', 'mode-film',
            'mode-glitch', 'mode-stack'
        );

        // Añadir clase del modo actual siempre (para CSS específico)
        galleryContainer.classList.add(`mode-${mode}`);

        // 2. Gestionar Swiper según el modo
        // Modos que requieren Swiper: 'swiper' (3D) y 'film' (Carrusel)
        if (mode === 'swiper' || mode === 'film') {
            
            // Destruir instancia anterior si existe (para reconfigurar)
            if (swiperInstance) {
                swiperInstance.destroy(true, true);
                swiperInstance = null;
            }

            galleryContainer.classList.add('swiper');
            
            // Inicializar con la configuración específica del modo
            initSwiper(mode);

        } else {
            // Modos CSS Grid/Flex (Bento, Hex, etc.)
            if (swiperInstance) {
                swiperInstance.destroy(true, true);
                swiperInstance = null;
            }
            galleryContainer.classList.remove('swiper');
        }
    }

    function initSwiper(mode) {
        if (typeof Swiper === 'undefined') return;

        let config = {};

        if (mode === 'swiper') {
            // Configuración 3D Coverflow (Original)
            config = {
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
                pagination: { el: ".swiper-pagination", clickable: true },
                navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
                loop: true,
                autoplay: { delay: 2500, disableOnInteraction: false },
                observer: true,
                observeParents: true
            };
        } 
        else if (mode === 'film') {
            // Configuración Carrusel Continuo (Film Strip)
            config = {
                slidesPerView: "auto", // Ancho automático basado en CSS
                spaceBetween: 0,       // Pegados como cinta
                loop: true,            // Infinito
                speed: 5000,           // Velocidad lenta y constante
                allowTouchMove: true,  // Permitir arrastrar
                autoplay: {
                    delay: 0,          // Sin pausa inicial
                    disableOnInteraction: false, // Seguir rodando tras tocar
                    pauseOnMouseEnter: true      // Pausar al pasar el mouse (tipo marquee)
                },
                // Desactivar efectos 3D
                effect: "slide",
                // Animación lineal pura
                freeMode: true,
                freeModeMomentum: false,
                
                // Ocultar controles estándar
                pagination: false,
                navigation: false,
                observer: true,
                observeParents: true
            };
        }

        swiperInstance = new Swiper("#visual-gallery", config);
    }

    // Inicializar
    setGalleryMode(currentGalleryMode);


    // ==========================================
    // 2. LIGHTBOX (VISOR DE IMÁGENES)
    // ==========================================
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxWrapper = lightboxModal ? lightboxModal.querySelector('.swiper-wrapper') : null;
    const lightboxClose = document.querySelector('.lightbox-close');
    let lightboxSwiper;

    function openLightbox(startIndex) {
        if (!lightboxWrapper) return;
        const galleryImages = Array.from(document.querySelectorAll('#visual-gallery .gallery-card img'));
        
        lightboxWrapper.innerHTML = '';
        galleryImages.forEach(img => {
            const slide = document.createElement('div');
            slide.classList.add('swiper-slide');
            const newImg = document.createElement('img');
            newImg.src = img.src;
            slide.appendChild(newImg);
            lightboxWrapper.appendChild(slide);
        });

        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (!lightboxSwiper) {
            lightboxSwiper = new Swiper(".lightbox-swiper", {
                zoom: true,
                navigation: { nextEl: ".lightbox-swiper .swiper-button-next", prevEl: ".lightbox-swiper .swiper-button-prev" },
                pagination: { el: ".lightbox-swiper .swiper-pagination", type: "fraction" },
                keyboard: { enabled: true },
                initialSlide: startIndex,
            });
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

    // Event Delegation
    const galleryContainerRef = document.getElementById('visual-gallery');
    if (galleryContainerRef) {
        galleryContainerRef.addEventListener('click', (e) => {
            const card = e.target.closest('.gallery-card');
            if (card) {
                // Lógica para encontrar el índice real considerando loops de Swiper
                let index = 0;
                
                // Si es un slide de Swiper (tiene atributos específicos)
                if (swiperInstance && card.classList.contains('swiper-slide')) {
                    // Usar el índice real proporcionado por Swiper para loops
                    const slideIndex = card.getAttribute('data-swiper-slide-index');
                    index = slideIndex ? parseInt(slideIndex) : swiperInstance.getSlideIndex(card);
                } else {
                    // Modo Grid/CSS normal
                    const allCards = Array.from(galleryContainerRef.querySelectorAll('.gallery-card'));
                    index = allCards.indexOf(card);
                }
                
                openLightbox(index);
            }
        });
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) closeLightbox();
    });


    // ==========================================
    // 3. PERSONALIZADOR (BOTONES)
    // ==========================================
    const customizerToggle = document.getElementById('customizer-toggle');
    const customizerPanel = document.getElementById('customizer-panel');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const modeBtns = document.querySelectorAll('.mode-btn');

    if (customizerToggle && customizerPanel) {
        customizerToggle.addEventListener('click', () => {
            customizerPanel.classList.toggle('active');
            const icon = customizerToggle.querySelector('i');
            if (customizerPanel.classList.contains('active')) icon.classList.replace('ph-gear', 'ph-x');
            else icon.classList.replace('ph-x', 'ph-gear');
        });
    }

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const themeClass = btn.getAttribute('data-theme');
            document.body.className = document.body.className.replace(/theme-\w+/g, ''); // Limpiar temas previos regex
            document.body.classList.add(themeClass);
            if(document.body.classList.contains('no-cursor')) document.body.classList.add('no-cursor'); // Mantener no-cursor
        });
    });

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.getAttribute('data-mode');
            setGalleryMode(mode);
            const gallerySection = document.getElementById('galeria');
            if(gallerySection) gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });


    // ==========================================
    // 4. GENERAL (MENU, HERO, SCROLL)
    // ==========================================
    // ... (Código estándar de menú y animaciones Hero se mantiene igual) ...
    const menuBtn = document.getElementById('menu-toggle');
    const navOverlay = document.getElementById('nav-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    const menuIcon = menuBtn ? menuBtn.querySelector('i') : null;
    
    function toggleMenu() {
        if(navOverlay.classList.contains('open')) {
            navOverlay.classList.remove('open');
            if(menuIcon) menuIcon.classList.replace('ph-x', 'ph-list');
        } else {
            navOverlay.classList.add('open');
            if(menuIcon) menuIcon.classList.replace('ph-list', 'ph-x');
        }
    }
    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    navLinks.forEach(link => link.addEventListener('click', toggleMenu));

    const heroContainer = document.querySelector('.hero-scroll-container');
    const scenes = document.querySelectorAll('.hero-scene'); 
    const blob1 = document.querySelector('.blob-1');
    const blob2 = document.querySelector('.blob-2');
    const shapes = document.querySelectorAll('.shape');
    const scrollBtn = document.getElementById('scroll-start-btn');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const navDots = document.querySelectorAll('.nav-dot');
    const sections = ['inicio', 'intro', 'servicios', 'portafolio', 'galeria', 'contacto'];

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

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});

