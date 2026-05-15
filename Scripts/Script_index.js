/* ============================================
   RUINAS DEL ABISMO — Game Logic
   SNES Boot Sequence + 8-bit Menu Controller
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // === REFERENCES ===
    const bootScreen = document.getElementById('boot-screen');
    const menuScreen = document.getElementById('menu-screen');
    const menuItems  = document.querySelectorAll('.menu-item');
    const pressStart = document.querySelector('.press-start');

    let currentIndex   = 0;
    let menuReady      = false;
    let bootFinished   = false;
    let menuItemsShown = false;

    // === SONIDO (descomenta y pon tu archivo de audio) ===
    // const bootSound = new Audio('assets/snes-boot.mp3');
    // const selectSound = new Audio('assets/menu-select.wav');
    // const confirmSound = new Audio('assets/menu-confirm.wav');
    // const cursorSound = new Audio('assets/cursor-move.wav');

    // =============================================
    //  BOOT SEQUENCE
    // =============================================

    function startBootSequence() {
        // --- Reproduce sonido de boot aquí ---
        // bootSound.play();

        // Duración total del boot: ~5 segundos, luego transición al menú
        setTimeout(() => {
            bootFinished = true;
            bootScreen.classList.add('hidden');

            // Espera a que termine el fade-out del boot
            setTimeout(() => {
                showMenu();
            }, 800);
        }, 5000);
    }

    // =============================================
    //  MENU SYSTEM
    // =============================================

    function showMenu() {
        menuScreen.classList.add('active');

        // Mostrar items del menú uno por uno con delay escalonado
        menuItems.forEach((item, i) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, 300 + i * 200);
        });

        // Activar controles después de que aparezcan todos
        setTimeout(() => {
            menuReady = true;
            updateSelection();
            if (pressStart) pressStart.style.display = 'none';
        }, 300 + menuItems.length * 200 + 200);
    }

    function updateSelection() {
        menuItems.forEach((item, i) => {
            item.classList.toggle('selected', i === currentIndex);
        });
        // --- Sonido de cursor ---
        // cursorSound.currentTime = 0;
        // cursorSound.play();
    }

    function moveUp() {
        if (!menuReady) return;
        currentIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
        updateSelection();
    }

    function moveDown() {
        if (!menuReady) return;
        currentIndex = (currentIndex + 1) % menuItems.length;
        updateSelection();
    }

    function confirmSelection() {
        if (!menuReady) return;
        menuReady = false;

        const selected = menuItems[currentIndex];

        // --- Sonido de confirmación ---
        // confirmSound.currentTime = 0;
        // confirmSound.play();

        // Flash estilo 8-bit al confirmar
        selected.classList.add('flash');

        setTimeout(() => {
            const action = selected.dataset.action;
            handleMenuAction(action);
            selected.classList.remove('flash');
            menuReady = true;
        }, 700);
    }

    function handleMenuAction(action) {
        switch (action) {
            case 'new-game':
                console.log('▶ NUEVA PARTIDA — Iniciando aventura...');
                window.location.href = './game.html';
                break;

            case 'continue':
                console.log('▶ CONTINUAR — Cargando partida...');
                alert('📜 Buscando partida guardada...');
                break;

            case 'settings':
                console.log('▶ AJUSTES — Abriendo configuración...');
                alert('⚙️ Pantalla de ajustes (próximamente)');
                break;

            case 'gallery':
                console.log('▶ GALERÍA — Abriendo colección...');
                alert('🖼️ Galería de arte (próximamente)');
                break;

            default:
                console.log('Acción no reconocida:', action);
        }
    }

    // =============================================
    //  CONTROLES — Teclado
    // =============================================

    document.addEventListener('keydown', (e) => {
        // Si el boot no ha terminado, skip al menú
        if (!bootFinished && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            skipBoot();
            return;
        }

        if (!menuReady) return;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                moveUp();
                break;

            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                moveDown();
                break;

            case 'Enter':
            case ' ':
            case 'z':
            case 'Z':
                e.preventDefault();
                confirmSelection();
                break;
        }
    });

    // =============================================
    //  CONTROLES — Mouse / Touch
    // =============================================

    menuItems.forEach((item, i) => {
        item.addEventListener('mouseenter', () => {
            if (!menuReady) return;
            currentIndex = i;
            updateSelection();
        });

        item.addEventListener('click', () => {
            if (!menuReady) return;
            currentIndex = i;
            updateSelection();
            confirmSelection();
        });
    });

    // =============================================
    //  SKIP BOOT (Enter/Space durante boot)
    // =============================================

    function skipBoot() {
        if (bootFinished) return;
        bootFinished = true;
        bootScreen.classList.add('hidden');
        setTimeout(() => showMenu(), 400);
    }

    // =============================================
    //  PARTÍCULAS AMBIENTALES
    // =============================================

    function spawnParticles() {
        const container = menuScreen;
        const count = 12;

        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.classList.add('pixel-particle');
            p.style.left   = Math.random() * 100 + '%';
            p.style.bottom  = Math.random() * 30 + '%';
            p.style.animationDelay    = Math.random() * 6 + 's';
            p.style.animationDuration = (4 + Math.random() * 4) + 's';
            container.appendChild(p);
        }
    }

    // =============================================
    //  INICIAR TODO
    // =============================================

    spawnParticles();
    startBootSequence();

});