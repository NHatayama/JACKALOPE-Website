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