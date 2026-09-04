// CSRF token, present on every page via the <meta name="csrf-token"> tag in base.html
function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
}

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Navbar background change on scroll (toggle class)
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const isScrolled = window.scrollY > 50;
    navbar.classList.toggle('scrolled', isScrolled);
});

// Initialize navbar state on load (handles mid-page loads)
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 105;
            const offsetTop = target.offsetTop - navbarHeight - 20; // Account for fixed navbar + padding
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.service-card, .fleet-card, .stat-item, .contact-item');
    animateElements.forEach(el => observer.observe(el));
});

// Contact form handling
const contactForm = document.querySelector('#contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            service: formData.get('service'),
            message: formData.get('message')
        };
        
        // Basic validation
        if (!data.name || !data.email || !data.service || !data.message) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        if (!isValidEmail(data.email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // Submit to backend
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken(),
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                showNotification(result.message, 'success');
                this.reset();
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Sorry, there was an error sending your message. Please try again later.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Driver application form handling
const driverApplicationForm = document.querySelector('#driverApplication');
if (driverApplicationForm) {
    driverApplicationForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state'),
            zipCode: formData.get('zipCode'),
            licenseNumber: formData.get('licenseNumber'),
            licenseState: formData.get('licenseState'),
            licenseExpiry: formData.get('licenseExpiry'),
            experience: formData.get('experience'),
            endorsements: formData.get('endorsements'),
            preferredRoutes: formData.get('preferredRoutes'),
            currentEmployer: formData.get('currentEmployer'),
            employmentStart: formData.get('employmentStart'),
            employmentEnd: formData.get('employmentEnd'),
            reasonForLeaving: formData.get('reasonForLeaving'),
            availability: formData.get('availability'),
            additionalInfo: formData.get('additionalInfo')
        };

        const submitBtn = this.querySelector('.btn-submit-application');
        const originalHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/application', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken(),
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                showNotification(result.message, 'success');
                this.reset();
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Sorry, there was an error submitting your application. Please try again later.', 'error');
        } finally {
            submitBtn.innerHTML = originalHtml;
            submitBtn.disabled = false;
        }
    });
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Stats counter animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-item h3');

    const formatNumber = (num, useGrouping) => {
        if (!useGrouping) return String(num);
        return num.toLocaleString(undefined);
    };

    counters.forEach(counter => {
        const originalText = counter.textContent.trim();
        // Extract leading number (with optional grouping commas) and treat the rest as suffix
        const match = originalText.match(/^(\d{1,3}(?:,\d{3})*|\d+)(.*)$/);
        if (!match) {
            counter.textContent = originalText;
            return;
        }

        const numericPart = match[1];
        const suffix = match[2] || '';
        const target = parseInt(numericPart.replace(/,/g, ''), 10);
        const useGrouping = /,/.test(numericPart);

        const duration = 2500; // 2.5 seconds instead of 1.2s
        const start = 0;
        const startTime = performance.now();

        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(start + (target - start) * progress);
            counter.textContent = `${formatNumber(current, useGrouping)}${suffix}`;
            if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    });
}

// Trigger counter animation when stats section is visible
const statsSection = document.querySelector('.stats');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statsObserver.observe(statsSection);
}

// Parallax effect for home section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const home = document.querySelector('.home');
    if (home) {
        const rate = scrolled * -0.5;
        home.style.transform = `translateY(${rate}px)`;
    }
});

// Add loading animation to service cards
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
    });
});

// Add hover effects to fleet cards
document.addEventListener('DOMContentLoaded', () => {
    const fleetCards = document.querySelectorAll('.fleet-card');
    fleetCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Form field focus effects
document.addEventListener('DOMContentLoaded', () => {
    const formFields = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    
    formFields.forEach(field => {
        field.addEventListener('focus', () => {
            field.parentElement.style.transform = 'translateY(-2px)';
        });
        
        field.addEventListener('blur', () => {
            field.parentElement.style.transform = 'translateY(0)';
        });
    });
});

// Add active state to navigation links based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 130;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Language Toggle Functionality
let currentLanguage = 'en';

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update any statically-translated element (nav links, hero eyebrow, etc.)
    document.querySelectorAll('[data-en]').forEach(el => {
        const value = el.getAttribute(`data-${lang}`);
        if (value) el.textContent = value;
    });
    
    // Update language toggle button
    const langToggle = document.getElementById('languageToggle');
    const langText = langToggle.querySelector('.lang-text');
    langText.textContent = lang.toUpperCase();
    
    // Update active state in dropdown
    const langOptions = document.querySelectorAll('.language-option');
    langOptions.forEach(opt => opt.classList.remove('active'));
    const activeOption = document.querySelector(`[data-lang="${lang}"]`);
    if (activeOption) {
        activeOption.classList.add('active');
    }
    
    // Update page content
    const t = translations[lang];
    
    // Home section
    const homeHeading = document.querySelector('.home h1');
    homeHeading._typingId = null; // cancel any in-progress typewriter effect
    homeHeading.textContent = t['home-title'];
    document.querySelector('.home p').textContent = t['home-subtitle'];
    document.querySelector('.btn-primary').textContent = t['get-quote'];
    document.querySelector('.btn-secondary').textContent = t['our-services'];
    
    // Stats section
    document.querySelectorAll('.stat-item p').forEach((item, index) => {
        const keys = ['fleet-vehicles', 'annual-mileage', 'customer-satisfaction', 'service-available'];
        if (keys[index]) {
            item.textContent = t[keys[index]];
        }
    });
    
    // About section
    document.querySelector('.about .section-header h2').textContent = t['about-title'];
    document.querySelector('.about .section-header p').textContent = t['about-subtitle'];
    
    // About content
    const aboutTexts = document.querySelectorAll('.about-text p');
    if (aboutTexts[0]) aboutTexts[0].textContent = t['about-story-text'];
    if (aboutTexts[1]) aboutTexts[1].textContent = t['about-mission-text'];
    
    // About values
    const aboutValues = document.querySelectorAll('.about-text li');
    if (aboutValues[0]) aboutValues[0].innerHTML = `<strong>${t['safety-first']}</strong> ${t['safety-desc']}`;
    if (aboutValues[1]) aboutValues[1].innerHTML = `<strong>${t['reliability']}</strong> ${t['reliability-desc']}`;
    if (aboutValues[2]) aboutValues[2].innerHTML = `<strong>${t['integrity']}</strong> ${t['integrity-desc']}`;
    if (aboutValues[3]) aboutValues[3].innerHTML = `<strong>${t['excellence']}</strong> ${t['excellence-desc']}`;
    
    // Services section
    document.querySelector('.services .section-header h2').textContent = t['services-title'];
    document.querySelector('.services .section-header p').textContent = t['services-subtitle'];
    
    // Services cards
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards[0]) {
        serviceCards[0].querySelector('h3').textContent = t['expedited-shipping'];
        serviceCards[0].querySelector('p').textContent = t['expedited-shipping-desc'];
    }
    if (serviceCards[1]) {
        serviceCards[1].querySelector('h3').textContent = t['ltl-ftl'];
        serviceCards[1].querySelector('p').textContent = t['ltl-ftl-desc'];
    }
    if (serviceCards[2]) {
        serviceCards[2].querySelector('h3').textContent = t['warehousing'];
        serviceCards[2].querySelector('p').textContent = t['warehousing-desc'];
    }
    if (serviceCards[3]) {
        serviceCards[3].querySelector('h3').textContent = t['cross-country'];
        serviceCards[3].querySelector('p').textContent = t['cross-country-desc'];
    }
    if (serviceCards[4]) {
        serviceCards[4].querySelector('h3').textContent = t['temperature-controlled'];
        serviceCards[4].querySelector('p').textContent = t['temperature-controlled-desc'];
    }
    if (serviceCards[5]) {
        serviceCards[5].querySelector('h3').textContent = t['hazmat-transport'];
        serviceCards[5].querySelector('p').textContent = t['hazmat-transport-desc'];
    }
    
    // Fleet section
    document.querySelector('.fleet .section-header h2').textContent = t['fleet-title'];
    document.querySelector('.fleet .section-header p').textContent = t['fleet-subtitle'];
    
    // Fleet cards
    const fleetCards = document.querySelectorAll('.fleet-card');
    if (fleetCards[0]) {
        fleetCards[0].querySelector('h3').textContent = t['dry-van-trailers'];
        fleetCards[0].querySelector('p').textContent = t['dry-van-trailers-desc'];
        const fleetList = fleetCards[0].querySelectorAll('li');
        if (fleetList[0]) fleetList[0].textContent = `${t['capacity']} Up to 45,000 lbs`;
        if (fleetList[1]) fleetList[1].textContent = `${t['length']} 53 feet`;
        if (fleetList[2]) fleetList[2].textContent = `${t['security']} GPS tracking`;
    }
    if (fleetCards[1]) {
        fleetCards[1].querySelector('h3').textContent = t['reefer-trailers'];
        fleetCards[1].querySelector('p').textContent = t['reefer-trailers-desc'];
        const fleetList = fleetCards[1].querySelectorAll('li');
        if (fleetList[0]) fleetList[0].textContent = `${t['temp-range']} -20°F to +70°F`;
        if (fleetList[1]) fleetList[1].textContent = t['real-time-monitoring'];
        if (fleetList[2]) fleetList[2].textContent = t['backup-refrigeration'];
    }
    if (fleetCards[2]) {
        fleetCards[2].querySelector('h3').textContent = t['flatbed-trailers'];
        fleetCards[2].querySelector('p').textContent = t['flatbed-trailers-desc'];
        const fleetList = fleetCards[2].querySelectorAll('li');
        if (fleetList[0]) fleetList[0].textContent = `${t['capacity']} Up to 48,000 lbs`;
        if (fleetList[1]) fleetList[1].textContent = `${t['length']} 48-53 feet`;
        if (fleetList[2]) fleetList[2].textContent = t['securment-equipment'];
    }
    
    // Contact section
    document.querySelector('.contact .section-header h2').textContent = t['contact-title'];
    document.querySelector('.contact .section-header p').textContent = t['contact-subtitle'];
    document.querySelector('.contact-form button').textContent = t['send-message'];
    
    // Contact info
    const contactItems = document.querySelectorAll('.contact-item');
    if (contactItems[0]) contactItems[0].querySelector('h3').textContent = t['phone'];
    if (contactItems[1]) contactItems[1].querySelector('h3').textContent = t['email'];
    if (contactItems[2]) {
        contactItems[2].querySelector('h3').textContent = t['address'];
        contactItems[2].querySelector('p').innerHTML = t['address-text'];
    }
    if (contactItems[3]) {
        contactItems[3].querySelector('h3').textContent = t['hours'];
        contactItems[3].querySelector('p').textContent = t['hours-text'];
    }
    
    // Form placeholders
    document.querySelector('input[type="text"]').placeholder = t['your-name'];
    document.querySelector('input[type="email"]').placeholder = t['your-email'];
    document.querySelector('input[type="tel"]').placeholder = t['your-phone'];
    document.querySelector('select option[value=""]').textContent = t['select-service'];
    document.querySelector('textarea').placeholder = t['message'];
    
    // Footer
    const footerSections = document.querySelectorAll('.footer-section');
    if (footerSections[1]) footerSections[1].querySelector('h4').textContent = t['footer-services'];
    if (footerSections[2]) footerSections[2].querySelector('h4').textContent = t['footer-company'];
    if (footerSections[3]) footerSections[3].querySelector('h4').textContent = t['footer-contact-info'];
    
    const footerLinks = document.querySelectorAll('.footer-section ul li a');
    if (footerLinks[3]) footerLinks[3].textContent = t['footer-careers'];
    
    const footerDescription = document.querySelector('.footer-section p');
    if (footerDescription) footerDescription.textContent = t['footer-description'];
    
    const footerCopyright = document.querySelector('.footer-bottom p');
    if (footerCopyright) footerCopyright.textContent = `© ${new Date().getFullYear()} ${t['footer-copyright']}`;
}

// Language dropdown functionality
document.addEventListener('DOMContentLoaded', () => {
    const langToggle = document.getElementById('languageToggle');
    const languageOptions = document.getElementById('languageOptions');
    const langOptions = document.querySelectorAll('.language-option');
    
    // Toggle dropdown on button click
    langToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        languageOptions.classList.toggle('show');
    });
    
    // Handle language selection
    langOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const selectedLang = option.getAttribute('data-lang');
            switchLanguage(selectedLang);
            languageOptions.classList.remove('show');
            
            // Update active state
            langOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        languageOptions.classList.remove('show');
    });
    
    // Set initial active state
    const currentLangOption = document.querySelector(`[data-lang="${currentLanguage}"]`);
    if (currentLangOption) {
        currentLangOption.classList.add('active');
    }
});

// Add CSS for active navigation state
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: #dc2626 !important;
    }
    .nav-link.active::after {
        width: 100% !important;
    }
`;
document.head.appendChild(style);

// Add floating animation to elements
function addFloatingAnimation() {
    const floatingElements = document.querySelectorAll('.service-icon, .fleet-image');
    
    floatingElements.forEach((element, index) => {
        element.style.animation = `float 3s ease-in-out infinite`;
        element.style.animationDelay = `${index * 0.5}s`;
    });
}

// Add CSS for floating animation
const floatingStyle = document.createElement('style');
floatingStyle.textContent = `
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    @keyframes glow {
        0%, 100% { box-shadow: 0 0 5px rgba(245, 41, 42, 0.3); }
        50% { box-shadow: 0 0 20px rgba(245, 41, 42, 0.6); }
    }
    
    .glow {
        animation: glow 2s ease-in-out infinite;
    }
`;
document.head.appendChild(floatingStyle);

// Add glow effect to important elements
function addGlowEffect() {
    const glowElements = document.querySelectorAll('.btn-primary, .service-icon');
    
    glowElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.classList.add('glow');
        });
        
        element.addEventListener('mouseleave', () => {
            element.classList.remove('glow');
        });
    });
}

// Add ripple effect to buttons
function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add CSS for ripple effect
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Initialize all animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addFloatingAnimation();
    addGlowEffect();
    addRippleEffect();
});
