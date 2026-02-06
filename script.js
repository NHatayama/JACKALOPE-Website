// Smooth Scrolling for Nav Links & Logo
document.querySelectorAll('nav a, .logo-link').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const targetElement = document.querySelector(href);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll Reveal Effect for technical Spec Cards
const observerOptions = { threshold: 0.2 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

document.querySelectorAll('.card, .data-box, .innovation-card, .team-member').forEach(element => {
    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";
    element.style.transition = "all 0.6s ease-out";
    observer.observe(element);
});

// Per-letter tooltip for hero H1 (JACKALOPE): shows an acronym word above each letter on hover/focus
(function() {
    const heroHeading = document.querySelector('.hero .overlay h1');
    if (!heroHeading) return;

    const rawText = heroHeading.textContent.trim();
    if (!rawText) return;

    // Acronym words for each letter in JACKALOPE (by position)
    const acronym = [
        'Jumping',      // J
        'Autonomous',   // A
        'Celestial',    // C
        'Kinetic',      // K
        'Adaptive',     // A
        'Lightweight',  // L
        'Orbital',      // O
        'Precision',    // P
        'Explorer'      // E
    ];

    // create tooltip element appended to body
    const tooltip = document.createElement('div');
    tooltip.className = 'letter-tooltip';
    tooltip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tooltip);

    // clear the heading and rebuild with per-letter spans
    heroHeading.innerHTML = '';
    let activeSpan = null;
    const TOOLTIP_OFFSET = 12; // px between top of letter and tooltip
    Array.from(rawText).forEach((ch, idx) => {
        const span = document.createElement('span');
        span.className = 'hero-letter';
        span.textContent = ch;
        span.tabIndex = 0; // keyboard focusable

        const meaning = acronym[idx] || (ch === ' ' ? '' : `Letter ${ch}`);
        span.dataset.meaning = meaning;

        const updateTooltipPosition = () => {
            const rect = span.getBoundingClientRect();
            const top = rect.top - TOOLTIP_OFFSET; // fixed viewport coordinate
            const left = rect.left + rect.width / 2;
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        };

        const show = () => {
            if (!meaning) return;
            activeSpan = span;
            tooltip.textContent = `${ch} — ${meaning}`;
            tooltip.setAttribute('aria-hidden', 'false');
            updateTooltipPosition();
            // use CSS class to animate from above into place
            tooltip.classList.add('visible');
        };

        const hide = () => {
            tooltip.classList.remove('visible');
            tooltip.setAttribute('aria-hidden', 'true');
            activeSpan = null;
        };

        span.addEventListener('mouseenter', show);
        span.addEventListener('focus', show);
        span.addEventListener('mouseleave', hide);
        span.addEventListener('blur', hide);
        span.addEventListener('touchstart', (e) => {
            e.preventDefault();
            show();
            setTimeout(hide, 1400);
        }, { passive: false });

        heroHeading.appendChild(span);
    });

    // keep tooltip positioned above the active letter while scrolling
    const onScroll = () => {
        if (activeSpan && tooltip.classList.contains('visible')) {
            // update position to track the letter in viewport coordinates
            const rect = activeSpan.getBoundingClientRect();
            const top = rect.top - TOOLTIP_OFFSET;
            const left = rect.left + rect.width / 2;
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        }
    };

    // hide tooltip on resize (keep tooltip usable after scrolling)
    const hideOnResize = () => { tooltip.classList.remove('visible'); tooltip.setAttribute('aria-hidden', 'true'); activeSpan = null; };
    window.addEventListener('resize', hideOnResize);
    window.addEventListener('scroll', onScroll, { passive: true });
})();

// Responsive nav toggle (hamburger)
(function() {
    const nav = document.querySelector('nav');
    const toggle = document.querySelector('.nav-toggle');
    const mainNav = document.getElementById('main-nav');
    if (!nav || !toggle || !mainNav) return;

    const setExpanded = (val) => {
        toggle.setAttribute('aria-expanded', String(val));
        if (val) nav.classList.add('open'); else nav.classList.remove('open');
    };

    toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        setExpanded(!expanded);
    });

    // Close the menu when a nav link is clicked (useful on mobile)
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setExpanded(false));
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setExpanded(false);
    });

    // Ensure menu closes when resizing to larger screens
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) setExpanded(false);
    });
})();

// Lightbox: open media in fullscreen with close controls
(function() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    const openLightbox = (src, alt) => {
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightbox.classList.add('visible');
        lightbox.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
    };

    const closeLightbox = () => {
        lightbox.classList.remove('visible');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImg.src = '';
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
    };

    // attach click handlers to media images
    document.querySelectorAll('.media-box img, .media-box video').forEach(media => {
        media.style.cursor = 'zoom-in';
        media.addEventListener('click', (e) => {
            const src = media.currentSrc || media.src;
            const alt = media.alt || '';
            openLightbox(src, alt);
        });
    });

    // close button
    closeBtn.addEventListener('click', closeLightbox);

    // click outside image to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightboxImg) {
            // if clicked the backdrop or the image itself (click image also closes)
            closeLightbox();
        }
    });

    // Escape key closes
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('visible')) closeLightbox();
    });
})();