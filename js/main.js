// Main JavaScript functionality
console.log('Main.js loaded');

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - main.js');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenu && navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // ===========================
    // Testimonial Slider
    // ===========================
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.dot');

    let currentIndex = 0;

    function showTestimonial(index) {
        testimonials.forEach((t, i) => {
            t.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        currentIndex = index;
    }

    if (dots.length > 0) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showTestimonial(index);
            });
        });
    }

    // Auto-rotate testimonials every 5 seconds
    if (testimonials.length > 0) {
        setInterval(() => {
            const nextIndex = (currentIndex + 1) % testimonials.length;
            showTestimonial(nextIndex);
        }, 5000);
    }
});

// Utility Functions
const utils = {
    // Show loading state on button
    showLoading: function(button) {
        if (button) {
            button.classList.add('loading');
            button.disabled = true;
            const btnText = button.querySelector('.btn-text');
            const btnLoading = button.querySelector('.btn-loading');
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline-flex';
        }
    },

    // Hide loading state on button
    hideLoading: function(button) {
        if (button) {
            button.classList.remove('loading');
            button.disabled = false;
            const btnText = button.querySelector('.btn-text');
            const btnLoading = button.querySelector('.btn-loading');
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    },

    // Show error message
    showError: function(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    },

    // Hide error message
    hideError: function(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    },

    // Show success message
    showSuccess: function(message) {
        // Create success notification
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        // Insert at top of page
        const firstChild = document.body.firstChild;
        document.body.insertBefore(successDiv, firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 5000);
    },

    // Format date
    formatDate: function(date) {
        return new Intl.DateTimeFormat('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    },

    // Format time
    formatTime: function(date) {
        return new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(new Date(date));
    },

    // Validate email
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate phone number (Ghana format)
    validatePhone: function(phone) {
        const phoneRegex = /^(\+233|0)[2-5][0-9]{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    },

    // Generate initials from name
    generateInitials: function(firstName, lastName) {
        const first = firstName ? firstName.charAt(0).toUpperCase() : '';
        const last = lastName ? lastName.charAt(0).toUpperCase() : '';
        return first + last;
    },

    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    // You can add error reporting service here
});

// Export utils for use in other scripts
window.utils = utils;
console.log('Utils exported to window:', window.utils);

// ===========================
// POLICY POPUPS
// ===========================
function showTermsAndConditions() {
    const content = `
<h3>Terms & Conditions</h3>
<div style="max-height: 400px; overflow-y: auto; text-align: left;">
<h4>1. Acceptance of Terms</h4>
<p>By using GhanaHealth+, you agree to these terms and conditions.</p>

<h4>2. Medical Disclaimer</h4>
<p>Our platform provides health information and connects you with healthcare providers. It does not replace professional medical advice.</p>

<h4>3. User Responsibilities</h4>
<p>• Provide accurate health information<br>
• Respect healthcare providers<br>
• Pay for services as agreed</p>

<h4>4. Privacy & Data</h4>
<p>We protect your health data according to Ghana's Data Protection Act and international standards.</p>

<h4>5. Service Availability</h4>
<p>We strive for 24/7 availability but cannot guarantee uninterrupted service.</p>

<h4>6. Limitation of Liability</h4>
<p>GhanaHealth+ is not liable for medical outcomes. Always seek emergency care when needed.</p>
</div>
    `;
    showPolicyPopup('Terms & Conditions', content);
}

function showPrivacyPolicy() {
    const content = `
<h3>Privacy Policy</h3>
<div style="max-height: 400px; overflow-y: auto; text-align: left;">
<h4>Information We Collect</h4>
<p>• Personal details (name, contact info)<br>
• Health information you provide<br>
• Usage data and preferences</p>

<h4>How We Use Your Data</h4>
<p>• Provide healthcare services<br>
• Connect you with doctors<br>
• Improve our platform<br>
• Send important notifications</p>

<h4>Data Protection</h4>
<p>• Encrypted data transmission<br>
• Secure servers in Ghana<br>
• Limited access to authorized personnel<br>
• Regular security audits</p>

<h4>Your Rights</h4>
<p>• Access your data<br>
• Request corrections<br>
• Delete your account<br>
• Data portability</p>

<h4>Contact</h4>
<p>For privacy concerns: privacy@ghanahealthplus.com</p>
</div>
    `;
    showPolicyPopup('Privacy Policy', content);
}

function showPolicyPopup(title, content) {
    const popup = document.createElement('div');
    popup.className = 'policy-popup-overlay';
    popup.innerHTML = `
        <div class="policy-popup">
            <div class="policy-header">
                <h2>${title}</h2>
                <button class="close-btn" onclick="closePolicyPopup()">&times;</button>
            </div>
            <div class="policy-content">
                ${content}
            </div>
            <div class="policy-footer">
                <button class="btn btn-primary" onclick="closePolicyPopup()">I Understand</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';
}

function closePolicyPopup() {
    const popup = document.querySelector('.policy-popup-overlay');
    if (popup) {
        popup.remove();
        document.body.style.overflow = '';
    }
}

// Global functions
window.showTermsAndConditions = showTermsAndConditions;
window.showPrivacyPolicy = showPrivacyPolicy;
window.closePolicyPopup = closePolicyPopup;
