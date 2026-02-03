document.addEventListener('DOMContentLoaded', function () {

    // Mobile Menu Toggle (Simplified as requested by previous cleanups)
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const navMenu = document.getElementById('nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.add('active');
        });
    }

    if (mobileMenuClose && navMenu) {
        mobileMenuClose.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    }

    // Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: unobserve after revealing
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));
});
