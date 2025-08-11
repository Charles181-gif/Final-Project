// Home page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Testimonials carousel
    initTestimonialsCarousel();
    
    // Intersection Observer for animations
    initScrollAnimations();
});

function initTestimonialsCarousel() {
    const testimonials = [
        {
            text: "Medaase! This platform helped me consult with a specialist without traveling to Korle-Bu. Very convenient!",
            author: "Akosua Mensah",
            location: "Accra",
            rating: 5
        },
        {
            text: "The doctors are very professional and speak both English and Twi. Made me feel comfortable discussing my health.",
            author: "Kwame Asante",
            location: "Kumasi",
            rating: 5
        },
        {
            text: "Affordable healthcare at my fingertips. The chat feature is excellent for quick consultations.",
            author: "Ama Boateng",
            location: "Takoradi",
            rating: 5
        }
    ];

    let currentTestimonial = 0;
    const testimonialElement = document.querySelector('.testimonial');
    const dots = document.querySelectorAll('.dot');

    function updateTestimonial(index) {
        if (!testimonialElement) return;
        
        const testimonial = testimonials[index];
        
        // Update content with fade effect
        testimonialElement.style.opacity = '0';
        
        setTimeout(() => {
            // Update stars
            const starsContainer = testimonialElement.querySelector('.testimonial-stars');
            if (starsContainer) {
                starsContainer.innerHTML = '';
                for (let i = 0; i < testimonial.rating; i++) {
                    const star = document.createElement('i');
                    star.className = 'fas fa-star';
                    starsContainer.appendChild(star);
                }
            }

            // Update text
            const quote = testimonialElement.querySelector('blockquote');
            if (quote) {
                quote.textContent = `"${testimonial.text}"`;
            }

            // Update author
            const authorName = testimonialElement.querySelector('.testimonial-author strong');
            const authorLocation = testimonialElement.querySelector('.testimonial-author span');
            if (authorName) authorName.textContent = testimonial.author;
            if (authorLocation) authorLocation.textContent = testimonial.location;

            // Update dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });

            testimonialElement.style.opacity = '1';
        }, 300);
    }

    // Auto-rotate testimonials
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        updateTestimonial(currentTestimonial);
    }, 5000);

    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentTestimonial = index;
            updateTestimonial(currentTestimonial);
        });
    });
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .doctor-card, .stat');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Stagger animation for service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });

    // Stagger animation for doctor cards
    const doctorCards = document.querySelectorAll('.doctor-card');
    doctorCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
}

// Stats counter animation
function animateStats() {
    const stats = [
        { element: document.querySelector('.stat:nth-child(1) .stat-number'), target: 500, suffix: '+' },
        { element: document.querySelector('.stat:nth-child(2) .stat-number'), target: 10000, suffix: '+' },
        { element: document.querySelector('.stat:nth-child(3) .stat-number'), target: 24, suffix: '/7' }
    ];

    stats.forEach(stat => {
        if (!stat.element) return;
        
        let current = 0;
        const increment = stat.target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= stat.target) {
                current = stat.target;
                clearInterval(timer);
            }
            
            if (stat.suffix === '/7') {
                stat.element.textContent = `${Math.floor(current)}/7`;
            } else {
                stat.element.textContent = `${Math.floor(current).toLocaleString()}${stat.suffix}`;
            }
        }, 50);
    });
}

// Trigger stats animation when hero section is visible
const heroSection = document.querySelector('.hero');
if (heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                heroObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    heroObserver.observe(heroSection);
}
