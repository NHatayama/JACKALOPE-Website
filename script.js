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
        'Autonomously',   // A
        'Controlled',    // C
        'Kinetic',      // K
        'Aerial',     // A
        'Lunar',  // L
        'Optical',      // O
        'Polar',    // P
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
            // show only the meaning word (no leading letter)
            tooltip.textContent = meaning;
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
    const lightboxAnalysis = lightbox.querySelector('.lightbox-analysis');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    const openLightbox = (src, alt, analysisHtml) => {
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightboxAnalysis.innerHTML = analysisHtml || '';
        lightbox.classList.add('visible');
        lightbox.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
    };

    const closeLightbox = () => {
        lightbox.classList.remove('visible');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImg.src = '';
        lightboxAnalysis.innerHTML = '';
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
    };

    // attach click handlers to the whole media box (so clicking anywhere opens)
    document.querySelectorAll('.media-box').forEach(box => {
        box.style.cursor = 'zoom-in';
        box.addEventListener('click', (e) => {
            // prefer image or video src inside the box
            const media = box.querySelector('img, video');
            const src = media ? (media.currentSrc || media.src) : null;
            const alt = media ? (media.alt || '') : '';
            const analysisHtml = box.querySelector('.media-analysis') ? box.querySelector('.media-analysis').innerHTML : '';
            if (src) openLightbox(src, alt, analysisHtml);
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

/* Shooting stars - managed via JS so stars and their streaks line up precisely.
   The script dynamically creates star elements (core + tail) and animates them
   by transitioning transforms and opacity. This gives us precise control over
   timings, positions and ensures tails follow the star path exactly. */
(function() {
    const container = document.querySelector('.shooting-stars');
    if (!container) return;

    // Allow header background customization via data attributes:
    // <header id="hero" data-bg="/path/to/image.png" data-bg-transparent="true" data-bg-opacity="0.12">
    const header = container.closest('header') || document.getElementById('hero');
    if (header && header.dataset && header.dataset.bg) {
        const bgUrl = header.dataset.bg;
        const transparent = header.dataset.bgTransparent === 'true';
        const overlayAlpha = (header.dataset.bgOpacity !== undefined) ? parseFloat(header.dataset.bgOpacity) : (transparent ? 0 : 0.28);
        header.style.backgroundImage = `linear-gradient(rgba(0,0,0,${overlayAlpha}), rgba(0,0,0,${overlayAlpha})), url('${bgUrl}')`;
        header.style.backgroundSize = 'cover';
        header.style.backgroundPosition = 'center center';
    }

    // configuration for each star: start position (percent l,t), duration (ms), delay (ms), size (px), tail length (px)
    const specs = [
        { l:6, t:6, dur:9000, delay:800, size:3, tail:180 },
        { l:14, t:12, dur:11000, delay:3000, size:4, tail:200 },
        { l:4, t:20, dur:13000, delay:7000, size:5, tail:240 },
        { l:20, t:6, dur:10000, delay:2000, size:3, tail:220 },
        { l:30, t:18, dur:12000, delay:5000, size:4, tail:190 },
        { l:3, t:30, dur:14000, delay:9000, size:3, tail:260 },
        { l:12, t:28, dur:15000, delay:11000, size:2, tail:140 },
        { l:22, t:26, dur:16000, delay:14000, size:4, tail:200 },
        { l:2, t:12, dur:18000, delay:17000, size:5, tail:240 }
    ];

    // clear any existing children (in case HTML contains placeholders)
    container.innerHTML = '';

    // create background sparkling stars
    const bgWrapper = document.createElement('div');
    bgWrapper.className = 'bg-stars';
    const bgCount = 50;
    for (let i = 0; i < bgCount; i++) {
        const b = document.createElement('div');
        b.className = 'bg-star';
        const sizeClass = (Math.random() < 0.12) ? 'large' : (Math.random() < 0.35 ? 'medium' : 'small');
        b.classList.add(sizeClass);
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        b.style.left = left + '%';
        b.style.top = top + '%';
        const dur = 2000 + Math.random() * 5000;
        const delay = Math.random() * 5000;
        b.style.animation = `twinkle ${dur}ms ease-in-out ${delay}ms infinite`;
        bgWrapper.appendChild(b);
    }
    container.appendChild(bgWrapper);

    // helper to convert percent to px within container
    const percentToPx = (pct, axisSize) => (pct / 100) * axisSize;

    // create star elements (core + tail). JS will align tails to motion vector.
    const stars = specs.map((s) => {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = s.l + '%';
        star.style.top = s.t + '%';

        const tail = document.createElement('div');
        tail.className = 'tail';
        tail.style.width = s.tail + 'px';
        tail.style.opacity = '0';
        star.appendChild(tail);

        const core = document.createElement('div');
        core.className = 'core';
        core.style.width = s.size + 'px';
        core.style.height = s.size + 'px';
        star.appendChild(core);

        container.appendChild(star);
        return { el: star, tail, core, spec: s };
    });

    // animate star: compute travel vector based on current container size and align tail to be opposite that vector
    function animateStar(starObj) {
        const { el, tail, core, spec } = starObj;
        const rect = container.getBoundingClientRect();
        const startX = percentToPx(spec.l, rect.width);
        const startY = percentToPx(spec.t, rect.height);

        // travel distances - move roughly off-screen to the right and down
        const travelX = Math.max(rect.width, window.innerWidth) * 1.4;
        const travelY = Math.max(rect.height, window.innerHeight) * 0.35;

        // compute tail rotation so it trails opposite the velocity vector
        const velX = travelX;
        const velY = travelY;
        const tailAngleRad = Math.atan2(-velY, -velX); // opposite direction
        const tailAngleDeg = tailAngleRad * (180 / Math.PI);
        tail.style.transform = `translateY(-50%) rotate(${tailAngleDeg}deg)`;

        // set tail length relative to movement but clamp to spec.tail
        const travelMag = Math.sqrt(travelX * travelX + travelY * travelY);
        const tailLen = Math.min(spec.tail, Math.round(travelMag * 0.65));
    tail.style.width = tailLen + 'px';
    tail.style.left = '0px';
    tail.style.top = '50%';

        // initial state
        el.style.transition = 'none';
        el.style.transform = `translate(0px, 0px)`;
        el.style.opacity = '0';
        tail.style.opacity = '0';

        setTimeout(() => {
            requestAnimationFrame(() => {
                el.style.transition = `transform ${spec.dur}ms cubic-bezier(.2,.8,.2,1), opacity ${Math.min(600, spec.dur/6)}ms linear`;
                tail.style.transition = `opacity ${Math.min(600, spec.dur/6)}ms linear, width ${spec.dur}ms linear`;

                el.style.opacity = '1';
                tail.style.opacity = '0.95';

                el.style.transform = `translate(${travelX}px, ${travelY}px)`;

                // fade out slightly before animation ends
                setTimeout(() => {
                    el.style.opacity = '0';
                    tail.style.opacity = '0';
                }, spec.dur - 700);

                // reset and schedule next
                setTimeout(() => {
                    el.style.transition = 'none';
                    tail.style.transition = 'none';
                    el.style.transform = `translate(0px, 0px)`;
                    el.style.opacity = '0';
                    tail.style.opacity = '0';
                    const jitter = Math.round(Math.random() * 6000);
                    setTimeout(() => animateStar(starObj), Math.max(1200, spec.delay + jitter));
                }, spec.dur + 20);
            });
        }, spec.delay);
    }

    // kick off all stars
    stars.forEach(s => animateStar(s));

    // rebuild stars on resize so distances and angles recompute
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            container.querySelectorAll('.star').forEach(x => x.remove());
            const newStars = specs.map((s) => {
                const star = document.createElement('div'); star.className = 'star'; star.style.left = s.l + '%'; star.style.top = s.t + '%';
                const tail = document.createElement('div'); tail.className = 'tail'; tail.style.width = s.tail + 'px'; tail.style.opacity = '0'; tail.style.left = '0px'; star.appendChild(tail);
                const core = document.createElement('div'); core.className = 'core'; core.style.width = s.size + 'px'; core.style.height = s.size + 'px'; star.appendChild(core);
                container.appendChild(star);
                return { el: star, tail, core, spec: s };
            });
            newStars.forEach(s => animateStar(s));
        }, 250);
    });

})();