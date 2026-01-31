document.addEventListener('DOMContentLoaded', function () {
    const slides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;
    const slideInterval = 5000; // 5 seconds

    function nextSlide() {
        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');

        // Calculate next slide index
        currentSlide = (currentSlide + 1) % slides.length;

        // Add active class to next slide
        slides[currentSlide].classList.add('active');
    }

    // Start the slideshow if there are slides
    if (slides.length > 0) {
        setInterval(nextSlide, slideInterval);
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
