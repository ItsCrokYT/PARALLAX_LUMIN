document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. CURSOR PERSONALIZADO (SOLO ESCRITORIO) ---
    // ... (Código del cursor sin cambios) ...
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
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('active');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('active');
            });
        });
    }

    // --- SWIPER JS INIT (GALERÍA VISUAL) ---
    // Inicializamos Swiper solo si existe el elemento
    if (document.querySelector('.mySwiper')) {
        var swiper = new Swiper(".mySwiper", {
            effect: "coverflow",
            grabCursor: true, // Cambia el cursor a "mano" al agarrar
            centeredSlides: true,
            slidesPerView: "auto", // Ajuste automático basado en el ancho del slide CSS
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
            loop: true, // Loop infinito
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
            }
        });
    }

    // --- 1. LÓGICA DE NAVEGACIÓN MENU ---
    // ... (Resto del código de navegación sin cambios) ...
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

    if (menuBtn) {
        menuBtn.addEventListener('click', toggleMenu);
    }
    navLinks.forEach(link => {
        link.addEventListener('click', toggleMenu);
    });

    // --- 2. CONFIGURACIÓN DEL HERO ---
    const heroContainer = document.querySelector('.hero-scroll-container');
    const scenes = document.querySelectorAll('.hero-scene'); 
    const blob1 = document.querySelector('.blob-1');
    const blob2 = document.querySelector('.blob-2');
    const shapes = document.querySelectorAll('.shape');
    const scrollBtn = document.getElementById('scroll-start-btn');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    // --- 3. BARRA LATERAL (PUNTOS) ---
    const navDots = document.querySelectorAll('.nav-dot');
    // Actualizamos el array de secciones para incluir la nueva galería
    const sections = ['inicio', 'intro', 'servicios', 'portafolio', 'galeria', 'contacto'];

    // --- 4. FUNCIONALIDAD DE BOTONES ---
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            if (!heroContainer) return;
            const heroHeight = heroContainer.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollableDistance = heroHeight - windowHeight;
            const currentP = window.scrollY / (scrollableDistance || 1);
            const targets = [0.1, 0.28, 0.48, 0.68, 0.88, 1.05];
            const nextTarget = targets.find(t => t > currentP + 0.02) || targets[targets.length - 1];
            const targetScrollY = nextTarget * scrollableDistance;

            window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
        });
    }

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 5. ANIMACIÓN LOOP Y SCROLL SPY ---
    function setOpacity(element, opacity) {
        if (!element) return;
        element.style.opacity = Math.max(0, Math.min(1, opacity));
        const scale = 0.8 + (opacity * 0.2); 
        element.style.transform = `scale(${scale})`;
    }

    function animate() {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const heroHeight = heroContainer ? heroContainer.offsetHeight : 0;
        const scrollableDistance = heroHeight - windowHeight;
        const time = performance.now() / 1000;

        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('visible', scrollTop > windowHeight);
        }

        // --- LÓGICA BARRA LATERAL (SCROLL SPY) ---
        let currentSectionId = '';
        if (scrollTop < heroHeight - windowHeight / 2) {
            currentSectionId = 'inicio';
        } else {
            sections.slice(1).forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) {
                    const rect = section.getBoundingClientRect();
                    // Ajustamos la detección para que sea más fluida
                    if (rect.top <= windowHeight / 1.5 && rect.bottom >= windowHeight / 3) {
                        currentSectionId = sectionId;
                    }
                }
            });
        }

        navDots.forEach(dot => {
            dot.classList.remove('active');
            if (dot.getAttribute('data-target') === currentSectionId) {
                dot.classList.add('active');
            }
        });


        // --- LÓGICA HERO ---
        let p = 0;
        if (heroContainer && scrollTop < heroHeight + 100) {
            p = scrollTop / scrollableDistance;
            p = Math.max(0, Math.min(1, p));

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

            function calcSceneOpacity(progress, start, peak, end) {
                if (progress < start || progress > end) return 0;
                if (progress < peak) return (progress - start) / (peak - start);
                return 1 - (progress - peak) / (end - peak);
            }

            if (scrollBtn) {
                let btnOp = 1;
                if (p > 0.9) btnOp = 1 - ((p - 0.9) / 0.1); 
                scrollBtn.style.opacity = Math.max(0, btnOp);
                scrollBtn.style.pointerEvents = btnOp > 0.1 ? 'auto' : 'none';
            }

            if (p < 0.25) {
                let op = 0;
                if (p < 0.05) op = p / 0.05; 
                else if (p < 0.15) op = 1; 
                else op = 1 - ((p - 0.15) / 0.1); 
                setOpacity(scenes[0], op);
                scenes[0].style.pointerEvents = op > 0.1 ? "auto" : "none";
            } else {
                setOpacity(scenes[0], 0);
            }

            setOpacity(scenes[1], calcSceneOpacity(p, 0.15, 0.28, 0.4));
            setOpacity(scenes[2], calcSceneOpacity(p, 0.35, 0.48, 0.6));
            setOpacity(scenes[3], calcSceneOpacity(p, 0.55, 0.68, 0.8));
            if (p > 0.75) {
                let op = (p - 0.75) / 0.15;
                if (p > 0.95) op = 1 - ((p - 0.95) / 0.05);
                setOpacity(scenes[4], op);
            } else {
                setOpacity(scenes[4], 0);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});