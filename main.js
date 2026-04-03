const observerOptions = {
    root: null, // use the viewport
    rootMargin: '0px 0px -100px 0px', // Trigger 100px BEFORE it hits the bottom
    threshold: 0.1 // 10% of the item must be visible
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Optional: stop observing once shown to save performance
            // observer.unobserve(entry.target); 
        }
    });
}, observerOptions);

// Ensure the DOM is fully loaded before running
document.addEventListener('DOMContentLoaded', () => {
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (navToggle && mobileMenu) {
        const closeMenu = () => {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('show');
            navToggle.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
        };

        navToggle.addEventListener('click', () => {
            const isOpen = navToggle.classList.toggle('active');
            mobileMenu.classList.toggle('show', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
            mobileMenu.setAttribute('aria-hidden', String(!isOpen));
        });

        mobileMenu.addEventListener('click', (event) => {
            if (event.target.tagName.toLowerCase() === 'a') {
                closeMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 900) closeMenu();
        });
    }
});