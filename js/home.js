// Home page functionality
import { authFallback } from './auth-fallback.js';
import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    // Testimonials carousel
    initTestimonialsCarousel();
    
    // Intersection Observer for animations
    initScrollAnimations();
    
    // Initialize registration form if present
    initHomeRegistrationForm();
    
    // Initialize health metrics preview
    initHealthMetricsPreview();
    
    // Initialize service card interactions
    initServiceCardInteractions();
    
    // Update dashboard links after DOM is loaded
    setTimeout(updateDashboardLinks, 100);
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

// Health metrics preview functionality
function initHealthMetricsPreview() {
    const metricCards = document.querySelectorAll('.metric-card');
    
    // Simulate real-time health data updates
    function updateHealthMetrics() {
        const bpCard = document.querySelector('.metric-card:nth-child(1) .metric-value');
        const hrCard = document.querySelector('.metric-card:nth-child(2) .metric-value');
        const bmiCard = document.querySelector('.metric-card:nth-child(3) .metric-value');
        const medCard = document.querySelector('.metric-card:nth-child(4) .metric-value');
        
        if (bpCard) {
            // Simulate blood pressure variation
            const systolic = 115 + Math.floor(Math.random() * 15);
            const diastolic = 75 + Math.floor(Math.random() * 10);
            bpCard.textContent = `${systolic}/${diastolic}`;
            
            // Add flash effect
            bpCard.style.background = '#e3f2fd';
            setTimeout(() => {
                bpCard.style.background = 'transparent';
            }, 500);
        }
        
        if (hrCard) {
            // Simulate heart rate variation
            const heartRate = 68 + Math.floor(Math.random() * 12);
            hrCard.textContent = `${heartRate} bpm`;
            
            // Add flash effect
            hrCard.style.background = '#e8f5e8';
            setTimeout(() => {
                hrCard.style.background = 'transparent';
            }, 500);
        }
        
        if (bmiCard) {
            // Simulate slight BMI changes
            const bmi = (22.3 + (Math.random() * 0.4 - 0.2)).toFixed(1);
            bmiCard.textContent = bmi;
        }
        
        if (medCard) {
            // Simulate medication tracking
            const medications = ['2 Active', '3 Active', '4 Active'];
            const randomMed = medications[Math.floor(Math.random() * medications.length)];
            medCard.textContent = randomMed;
        }
    }
    
    // Update metrics every 8 seconds
    setInterval(updateHealthMetrics, 8000);
    
    // Add hover effects to metric cards
    metricCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
        
        // Add click handler to redirect to dashboard
        card.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    });
    
    // Animate metrics on scroll
    const metricsSection = document.querySelector('.health-preview');
    if (metricsSection) {
        const metricsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateMetricValues();
                    metricsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        metricsObserver.observe(metricsSection);
    }
}

// Animate metric values on first view
function animateMetricValues() {
    const metricValues = document.querySelectorAll('.metric-value');
    
    metricValues.forEach((value, index) => {
        const originalText = value.textContent;
        value.textContent = '0';
        
        setTimeout(() => {
            value.style.transition = 'all 0.8s ease';
            value.textContent = originalText;
            
            // Add a subtle glow effect
            value.style.textShadow = '0 0 10px rgba(0, 102, 204, 0.3)';
            setTimeout(() => {
                value.style.textShadow = 'none';
            }, 1000);
        }, index * 200);
    });
}

// Service card interactions
function initServiceCardInteractions() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        const button = card.querySelector('.btn');
        
        if (button) {
            // Add ripple effect on button click
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        }
        
        // Add hover effect to entire card
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
            card.style.boxShadow = '0 12px 30px rgba(0,0,0,0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });
    });
}

// Add CSS for ripple animation and modal styles
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .metric-card {
        cursor: pointer;
    }
    
    .metric-card:hover {
        cursor: pointer;
    }
    
    .service-card {
        position: relative;
        overflow: hidden;
    }
    
    .service-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        transition: left 0.5s;
    }
    
    .service-card:hover::before {
        left: 100%;
    }
    
    .dashboard-preview-modal .modal-content {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }
    
    .dashboard-preview-modal .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
    }
    
    .dashboard-preview-modal .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.2s;
    }
    
    .dashboard-preview-modal .modal-close:hover {
        background: #f0f0f0;
        color: #333;
    }
    
    .preview-features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .feature-item {
        text-align: center;
        padding: 1.5rem;
        border: 1px solid #eee;
        border-radius: 8px;
        transition: all 0.3s;
    }
    
    .feature-item:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        border-color: #0066cc;
    }
    
    .feature-item i {
        font-size: 2rem;
        color: #0066cc;
        margin-bottom: 1rem;
    }
    
    .feature-item h4 {
        margin-bottom: 0.5rem;
        color: #333;
    }
    
    .feature-item p {
        color: #666;
        font-size: 0.9rem;
    }
    
    .preview-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
    }
    
    @media (max-width: 768px) {
        .preview-features {
            grid-template-columns: 1fr;
        }
        
        .preview-actions {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(style);

// Registration form handler for home page
function initHomeRegistrationForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Password toggles
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    if (passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const isPassword = password.getAttribute('type') === 'password';
            password.setAttribute('type', isPassword ? 'text' : 'password');
            passwordToggle.querySelector('i').classList.toggle('fa-eye');
            passwordToggle.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    if (confirmPasswordToggle) {
        confirmPasswordToggle.addEventListener('click', () => {
            const isPassword = confirmPassword.getAttribute('type') === 'password';
            confirmPassword.setAttribute('type', isPassword ? 'text' : 'password');
            confirmPasswordToggle.querySelector('i').classList.toggle('fa-eye');
            confirmPasswordToggle.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        window.utils.hideError('errorMessage');
        window.utils.showLoading(submitButton);
        
        try {
            const formData = new FormData(form);
            const name = formData.get('name')?.trim();
            const email = formData.get('email')?.trim();
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            const terms = formData.get('terms');

            // Basic validations
            if (!name || !email || !password || !confirmPassword) {
                window.utils.showError('errorMessage', 'Please fill in all required fields.');
                window.utils.hideLoading(submitButton);
                return;
            }
            if (!window.utils.validateEmail(email)) {
                window.utils.showError('errorMessage', 'Please enter a valid email address.');
                window.utils.hideLoading(submitButton);
                return;
            }
            if (password.length < 6) {
                window.utils.showError('errorMessage', 'Password must be at least 6 characters long.');
                window.utils.hideLoading(submitButton);
                return;
            }
            if (password !== confirmPassword) {
                window.utils.showError('errorMessage', 'Passwords do not match.');
                window.utils.hideLoading(submitButton);
                return;
            }
            if (!terms) {
                window.utils.showError('errorMessage', 'You must agree to the Terms & Conditions.');
                window.utils.hideLoading(submitButton);
                return;
            }

            try {
                // Use fallback authentication
                console.log('Using fallback authentication system');
                const fallbackResult = await authFallback.signUp(email, password, { full_name: name });
                
                window.utils.showSuccess('Account created successfully! Redirecting to login...');
                form.reset();
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
                return;
            } catch (fallbackError) {
                // If fallback fails, try Supabase as backup
                try {
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                full_name: name
                            }
                        }
                    });

                    if (error) throw error;

                    const user = data.user;

                    // Create minimal patient profile document
                    if (user) {
                        const { error: insertError } = await supabase
                            .from('users')
                            .insert({
                                id: user.id,
                                email,
                                full_name: name,
                                user_type: 'patient',
                                created_at: new Date().toISOString(),
                                active: true
                            });
                        
                        if (insertError) {
                            console.warn('Could not create user profile:', insertError);
                        }
                    }
                    
                    window.utils.showSuccess('Account created successfully! Redirecting to login...');
                    form.reset();
                    
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                    
                } catch (signUpError) {
                    throw signUpError;
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            let message = 'Registration failed. Please try again.';
            if (error?.message?.includes('already registered')) message = 'An account with this email already exists.';
            if (error?.message?.includes('Password should be')) message = 'Password is too weak.';
            if (error?.message?.includes('Invalid email')) message = 'Invalid email address.';
            if (error?.message?.includes('captcha')) message = 'Registration temporarily unavailable. Please try again later.';
            window.utils.showError('errorMessage', message);
        } finally {
            window.utils.hideLoading(submitButton);
        }
    });
}

// Add dashboard preview functionality
function showDashboardPreview() {
    // Create a modal or overlay showing dashboard features
    const modal = document.createElement('div');
    modal.className = 'dashboard-preview-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>GhanaHealth+ Dashboard Preview</h3>
                <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="preview-features">
                    <div class="feature-item">
                        <i class="fas fa-chart-line"></i>
                        <h4>Health Analytics</h4>
                        <p>Track your vital signs and health trends over time</p>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-video"></i>
                        <h4>Telemedicine</h4>
                        <p>Video consultations with certified doctors</p>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-pills"></i>
                        <h4>Online Pharmacy</h4>
                        <p>Order medications with prescription upload</p>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-calendar-alt"></i>
                        <h4>Appointment Management</h4>
                        <p>Schedule and manage your medical appointments</p>
                    </div>
                </div>
                <div class="preview-actions">
                    <a href="#register" class="btn btn-primary">Sign Up to Access</a>
                    <a href="login.html" class="btn btn-outline">Login</a>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modal);
    
    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Check if user is logged in and redirect appropriately
function checkAuthAndRedirect(targetUrl = 'dashboard.html') {
    // Check if user is logged in
    const currentUser = localStorage.getItem('ghanahealth_current_user');
    
    if (currentUser) {
        // User is logged in, redirect to dashboard
        window.location.href = targetUrl;
    } else {
        // User not logged in, show preview or redirect to login
        if (targetUrl === 'dashboard.html') {
            showDashboardPreview();
        } else {
            window.location.href = 'login.html';
        }
    }
}

// Global functions for onclick handlers
window.showDashboardPreview = showDashboardPreview;
window.checkAuthAndRedirect = checkAuthAndRedirect;

// Update dashboard links to check authentication
function updateDashboardLinks() {
    // Update all dashboard links
    const dashboardLinks = document.querySelectorAll('a[href="dashboard.html"]');
    dashboardLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            checkAuthAndRedirect('dashboard.html');
        });
    });
}
