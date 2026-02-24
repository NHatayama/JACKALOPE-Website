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

// Lazy-load images in media gallery to reduce initial server requests
(function() {
    if (!('IntersectionObserver' in window)) return; // graceful fallback - browser will load images normally
    const lazyImgs = document.querySelectorAll('img.lazy');
    if (!lazyImgs.length) return;
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                if (src) {
                    img.src = src;
                    img.classList.remove('lazy');
                    img.removeAttribute('data-src');
                }
                obs.unobserve(img);
            }
        });
    }, { rootMargin: '200px 0px' });

    lazyImgs.forEach(i => observer.observe(i));
})();

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

    // Disable per-letter tooltips on touch devices or small screens for performance/usability
    // Removed checks to enable on mobile
    if (false) {
        // leave the heading text as-is (no per-letter spans)
        return;
    }

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
    const lightboxVideo = lightbox.querySelector('.lightbox-video');
    const lightboxAnalysis = lightbox.querySelector('.lightbox-analysis');
    const lightboxContent = lightbox.querySelector('.lightbox-content');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    const openLightbox = (src, alt, analysisHtml, isVideo) => {
        lightboxAnalysis.innerHTML = analysisHtml || '';
        // Hide both, then show appropriate media
        lightboxImg.style.display = 'none';
        lightboxVideo.style.display = 'none';
        lightboxImg.src = '';
        lightboxVideo.src = '';
        lightboxContent.classList.toggle('video-layout', isVideo);
        if (isVideo) {
            lightboxVideo.src = src;
            lightboxVideo.style.display = '';
            lightboxVideo.play().catch(() => {});
        } else {
            lightboxImg.src = src;
            lightboxImg.alt = alt || '';
            lightboxImg.style.display = '';
        }
        lightbox.classList.add('visible');
        lightbox.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
    };

    const closeLightbox = () => {
        lightbox.classList.remove('visible');
        lightbox.setAttribute('aria-hidden', 'true');
        // clear both media
        lightboxImg.src = '';
        if (lightboxVideo) {
            lightboxVideo.pause();
            lightboxVideo.src = '';
        }
        lightboxAnalysis.innerHTML = '';
        lightboxContent.classList.remove('video-layout');
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
            const isVideo = media && media.tagName && media.tagName.toLowerCase() === 'video';
            if (src) openLightbox(src, alt, analysisHtml, isVideo);
        });
    });

    // close button
    closeBtn.addEventListener('click', closeLightbox);

    // click outside image to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightboxImg || e.target === lightboxVideo) {
            // if clicked the backdrop or the media itself (click media also closes)
            closeLightbox();
        }
    });

    // Escape key closes
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('visible')) closeLightbox();
    });
})();

/* Shooting stars — pooled spawner implementation to minimize DOM allocations and timers.
   This keeps the same visual behavior but reuses a fixed pool of star DOM nodes.
*/
(function() {
    const container = document.querySelector('.shooting-stars');
    if (!container) return;

    // Allow header background customization via data attributes (unchanged behavior)
    const header = container.closest('header') || document.getElementById('hero');
    if (header && header.dataset && header.dataset.bg) {
        const bgUrl = header.dataset.bg;
        const transparent = header.dataset.bgTransparent === 'true';
        const overlayAlpha = (header.dataset.bgOpacity !== undefined) ? parseFloat(header.dataset.bgOpacity) : (transparent ? 0 : 0.28);
        header.style.backgroundImage = `linear-gradient(rgba(0,0,0,${overlayAlpha}), rgba(0,0,0,${overlayAlpha})), url('${bgUrl}')`;
        header.style.backgroundSize = 'cover';
        header.style.backgroundPosition = 'center center';
    }

    // base spawn specs (start positions and visual params)
    const baseSpecs = [
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

    // cleanup any placeholder content
    container.innerHTML = '';

    // create background sparkling stars (fewer on small screens)
    const isSmallScreen = window.innerWidth && window.innerWidth < 768;
    const bgCount = isSmallScreen ? 20 : 50;
    const bgWrapper = document.createElement('div');
    bgWrapper.className = 'bg-stars';
    for (let i = 0; i < bgCount; i++) {
        const b = document.createElement('div');
        b.className = 'bg-star';
        const sizeClass = (Math.random() < 0.12) ? 'large' : (Math.random() < 0.35 ? 'medium' : 'small');
        b.classList.add(sizeClass);
        b.style.left = (Math.random() * 100) + '%';
        b.style.top = (Math.random() * 100) + '%';
        const dur = 2000 + Math.random() * 5000;
        const delay = Math.random() * 5000;
        b.style.animation = `twinkle ${dur}ms ease-in-out ${delay}ms infinite`;
        bgWrapper.appendChild(b);
    }
    container.appendChild(bgWrapper);

    // Pool configuration
    const poolSize = isSmallScreen ? 6 : 12; // total DOM nodes to allocate once
    let maxConcurrent = isSmallScreen ? 2 : 5; // simultaneous moving stars

    // helper: create a star DOM node (core + tail)
    function createStarNode() {
        const star = document.createElement('div'); star.className = 'star';
        const tail = document.createElement('div'); tail.className = 'tail';
        const core = document.createElement('div'); core.className = 'core';
        star.appendChild(tail); star.appendChild(core);
        // initial hidden state
        star.style.opacity = '0'; tail.style.opacity = '0';
        return { el: star, tail, core, busy: false, timers: [] };
    }

    // allocate pool
    const pool = [];
    for (let i = 0; i < poolSize; i++) {
        const node = createStarNode();
        pool.push(node);
        container.appendChild(node.el);
    }

    // utility: clear timers attached to a pooled node
    function clearNodeTimers(node) {
        if (!node || !node.timers) return;
        node.timers.forEach(id => clearTimeout(id));
        node.timers.length = 0;
    }

    // spawn a single star using an idle node from the pool
    function spawn(spec) {
        const idle = pool.find(p => !p.busy);
        if (!idle) return false;
        idle.busy = true;
        clearNodeTimers(idle);

        const el = idle.el, tail = idle.tail, core = idle.core;

        // set visual params
        el.style.left = spec.l + '%'; el.style.top = spec.t + '%';
        core.style.width = spec.size + 'px'; core.style.height = spec.size + 'px';

        // compute travel distances relative to container/viewport
        const rect = container.getBoundingClientRect();
        const travelX = Math.max(rect.width, window.innerWidth) * 1.4;
        const travelY = Math.max(rect.height, window.innerHeight) * 0.35;

        // tail trails opposite velocity vector
        const tailAngleDeg = Math.atan2(-travelY, -travelX) * (180 / Math.PI);
        tail.style.transform = `translateY(-50%) rotate(${tailAngleDeg}deg)`;

        const travelMag = Math.sqrt(travelX * travelX + travelY * travelY);
        const tailLen = Math.min(spec.tail, Math.round(travelMag * 0.65));
        tail.style.width = tailLen + 'px'; tail.style.left = '0px'; tail.style.top = '50%';

        // reset transitions and state
        el.style.transition = 'none'; tail.style.transition = 'none';
        el.style.transform = 'translate(0px, 0px)'; el.style.opacity = '0'; tail.style.opacity = '0';

        // schedule start with some jitter to avoid lockstep
        const startDelay = spec.delay + Math.random() * 800;
        const startTimer = setTimeout(() => {
            requestAnimationFrame(() => {
                el.style.transition = `transform ${spec.dur}ms cubic-bezier(.2,.8,.2,1), opacity ${Math.min(600, spec.dur/6)}ms linear`;
                tail.style.transition = `opacity ${Math.min(600, spec.dur/6)}ms linear, width ${spec.dur}ms linear`;

                el.style.opacity = '1'; tail.style.opacity = '0.95';
                el.style.transform = `translate(${travelX}px, ${travelY}px)`;

                // fade a bit before end
                const fadeTimer = setTimeout(() => { el.style.opacity = '0'; tail.style.opacity = '0'; }, spec.dur - 700);

                // reset node and mark idle after animation
                const resetTimer = setTimeout(() => {
                    el.style.transition = 'none'; tail.style.transition = 'none';
                    el.style.transform = 'translate(0px, 0px)'; el.style.opacity = '0'; tail.style.opacity = '0';
                    idle.busy = false;
                }, spec.dur + 40);

                idle.timers.push(fadeTimer, resetTimer);
            });
        }, startDelay);

        idle.timers.push(startTimer);
        return true;
    }

    // spawn controller — maintain limited concurrency and randomized intervals
    let running = true;
    let currentConcurrent = 0;

    function scheduleSpawner() {
        if (!running) return;
        // cap concurrency by counting busy nodes
        currentConcurrent = pool.reduce((acc, p) => acc + (p.busy ? 1 : 0), 0);
        if (currentConcurrent < maxConcurrent) {
            // choose a random spec
            const spec = baseSpecs[Math.floor(Math.random() * baseSpecs.length)];
            spawn(spec);
        }
        // schedule next spawn with randomized interval
        const nextIn = 1200 + Math.random() * 5000;
        setTimeout(scheduleSpawner, nextIn);
    }

    // start the spawner
    scheduleSpawner();

    // handle resize: adjust concurrency and recreate bg stars if needed
    let resizeDeb = null;
    window.addEventListener('resize', () => {
        if (resizeDeb) clearTimeout(resizeDeb);
        resizeDeb = setTimeout(() => {
            const nowSmall = window.innerWidth && window.innerWidth < 768;
            maxConcurrent = nowSmall ? 2 : 5;
            // rebuild simple bg stars field without touching the pool DOM nodes
            const existingBg = container.querySelector('.bg-stars');
            if (existingBg) existingBg.remove();
            const newBg = document.createElement('div'); newBg.className = 'bg-stars';
            const newCount = nowSmall ? 20 : 50;
            for (let i = 0; i < newCount; i++) {
                const b = document.createElement('div'); b.className = 'bg-star';
                const sizeClass = (Math.random() < 0.12) ? 'large' : (Math.random() < 0.35 ? 'medium' : 'small');
                b.classList.add(sizeClass);
                b.style.left = (Math.random() * 100) + '%'; b.style.top = (Math.random() * 100) + '%';
                const dur = 2000 + Math.random() * 5000; const delay = Math.random() * 5000;
                b.style.animation = `twinkle ${dur}ms ease-in-out ${delay}ms infinite`;
                newBg.appendChild(b);
            }
            container.appendChild(newBg);
        }, 300);
    });

})();


/* Rotating model animation: smooth, time-based rotation using requestAnimationFrame.
   Adds subtle tilt, bob, and a moving shine to emphasize the model. Pauses transform on hover/tap. */
(function() {
    const plinth = document.querySelector('.plinth');
    const model = plinth ? plinth.querySelector('.rotating-model') : null;
    const shine = plinth ? plinth.querySelector('.shine') : null;
    if (!plinth || !model) return;

    let last = null;
    let rotationSpeed = 0.015; // degrees per ms (slightly slower)
    let bobAmt = 4; // px vertical bob amplitude (smaller)
    let tiltAmt = 4; // deg (smaller tilt)
    const smallScreen = window.innerWidth && window.innerWidth < 600;
    if (smallScreen) {
        rotationSpeed *= 0.55;
        bobAmt = Math.max(1, Math.round(bobAmt * 0.5));
        tiltAmt = Math.max(1, Math.round(tiltAmt * 0.5));
    }

    // smoothing state
    let currentAngle = 0;
    let currentTilt = 0;
    let currentScale = 1;
    let targetAngle = 0;
    let targetTilt = 0;
    let targetScale = 1;
    let hovered = false;

    plinth.addEventListener('mouseenter', () => { hovered = true; });
    plinth.addEventListener('mouseleave', () => { hovered = false; });
    plinth.addEventListener('touchstart', () => { hovered = true; setTimeout(()=> hovered = false, 1000); }, { passive: true });

    function lerp(a, b, t) { return a + (b - a) * t; }

    function step(ts) {
        if (!last) last = ts;
        const dt = ts - last; last = ts;

        // base motion values (time-derived)
        targetAngle = (ts * rotationSpeed) % 360;
        targetTilt = Math.sin(ts / 1200) * tiltAmt;
        const bob = Math.sin(ts / 900) * bobAmt;

        // hover reduces rotation speed and slightly increases scale/tilt but smoothly
        const hoverMult = hovered ? 0.45 : 1.0; // slower rotation when hovered
        const hoverScale = hovered ? 1.02 : 1.0;
        const hoverTilt = hovered ? targetTilt * 1.1 : targetTilt;

        // apply hover multipliers to targets
        targetAngle = targetAngle * hoverMult;
        targetTilt = hoverTilt;
        targetScale = hoverScale;

        // smooth current values towards targets
        currentAngle = lerp(currentAngle, targetAngle, 0.08);
        currentTilt = lerp(currentTilt, targetTilt, 0.06);
        currentScale = lerp(currentScale, targetScale, 0.06);

        // apply transforms
        model.style.transform = `rotateY(${currentAngle}deg) rotateX(${currentTilt}deg) scale(${currentScale})`;

        // plinth subtle vertical movement (shadow handled by CSS ::after)
        plinth.style.transform = `translateY(${bob}px)`;

        // animate atmosphere overlay slightly for non-rigid effect
        if (shine) {
            let a = Math.sin(ts / 1400) * 6; // small movement
            let b = Math.cos(ts / 1700) * 8;
            if (smallScreen) { a *= 0.5; b *= 0.55; }
            shine.style.backgroundPosition = `${50 + a}% ${50 + b}%`;
            // gentle opacity breathing
            const baseOpacity = smallScreen ? 0.5 : 0.55;
            const breath = smallScreen ? 0.035 : 0.06;
            shine.style.opacity = (baseOpacity + Math.sin(ts / 3200) * breath).toFixed(3);
        }

        requestAnimationFrame(step);
    }

    // kick off animation
    requestAnimationFrame(step);
})();