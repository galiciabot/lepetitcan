/**
 * LE PETIT CAN - Interactive Elements
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Sticky Header
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if(menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (nav.classList.contains('active')) {
                icon.classList.replace('ph-list', 'ph-x');
            } else {
                icon.classList.replace('ph-x', 'ph-list');
            }
        });

        // Close mobile menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if(icon) {
                    icon.classList.replace('ph-x', 'ph-list');
                }
            });
        });
    }

    // 3. Initialize Swiper for Services
    if (typeof Swiper !== 'undefined') {
        new Swiper('.services-swiper', {
            slidesPerView: 3,
            spaceBetween: 30,
            loop: true,
            breakpoints: {
                320: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                },
                576: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                992: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                },
                1200: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                }
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            }
        });
    }

    // Swiper is handling interactions natively with CSS. Buttons are standard anchor links.

    // 4. FAQs Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question');
        if(btn) {
            btn.addEventListener('click', () => {
                // Close other items for a cleaner accordion feel
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });

    // 5. ScrollSpy - Highlight active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Subtract header height or offset
            if (window.scrollY >= (sectionTop - 150)) {
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

    // 6. Smooth scroll for anchor links (safeguard for browsers without CSS smooth scroll)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                e.preventDefault();
                // Offset calculation if needed based on header height
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 7. Simple form submission handler
    const contactForm = document.getElementById('contactForm');
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Just visual feedback for the static site
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            
            submitBtn.innerText = "¡Solicitud enviada!";
            submitBtn.style.backgroundColor = "var(--green-dark)";
            
            setTimeout(() => {
                submitBtn.innerText = originalText;
                submitBtn.style.backgroundColor = "";
                contactForm.reset();
            }, 3000);
        });
    }

    // 8. Cookie Consent Banner
    const cookieBanner  = document.getElementById('cookie-banner');
    const cookieModal   = document.getElementById('cookie-modal');
    const acceptBtn     = document.getElementById('cookie-accept-btn');
    const rejectBtn     = document.getElementById('cookie-reject-btn');
    const configBtn     = document.getElementById('cookie-config-btn');
    const modalClose    = document.getElementById('cookie-modal-close');
    const saveBtn       = document.getElementById('cookie-save-btn');
    const analyticsChk  = document.getElementById('cookie-analytics');
    const marketingChk  = document.getElementById('cookie-marketing');

    const COOKIE_KEY = 'lepetitcan_cookie_consent';

    function saveCookiePrefs(analytics, marketing) {
        const prefs = {
            essential: true,
            analytics: analytics,
            marketing: marketing,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(COOKIE_KEY, JSON.stringify(prefs));
    }

    function hideBanner() {
        cookieBanner.classList.remove('visible');
        cookieBanner.classList.add('hidden');
    }

    function showBanner() {
        // Small delay for page load animation
        setTimeout(() => {
            cookieBanner.classList.add('visible');
        }, 1200);
    }

    function openModal() {
        // Load saved prefs into modal if they exist
        const saved = localStorage.getItem(COOKIE_KEY);
        if (saved) {
            try {
                const prefs = JSON.parse(saved);
                if (analyticsChk) analyticsChk.checked = prefs.analytics || false;
                if (marketingChk) marketingChk.checked = prefs.marketing || false;
            } catch(e) {}
        }
        if (cookieModal) cookieModal.removeAttribute('hidden');
    }

    function closeModal() {
        if (cookieModal) cookieModal.setAttribute('hidden', '');
    }

    // Check if user already decided
    if (!localStorage.getItem(COOKIE_KEY)) {
        showBanner();
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            saveCookiePrefs(true, true);
            hideBanner();
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            saveCookiePrefs(false, false);
            hideBanner();
        });
    }

    if (configBtn) {
        configBtn.addEventListener('click', () => {
            openModal();
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Close modal on overlay click
    if (cookieModal) {
        cookieModal.addEventListener('click', (e) => {
            if (e.target === cookieModal) closeModal();
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cookieModal && !cookieModal.hasAttribute('hidden')) {
            closeModal();
        }
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const analytics = analyticsChk ? analyticsChk.checked : false;
            const marketing = marketingChk ? marketingChk.checked : false;
            saveCookiePrefs(analytics, marketing);
            closeModal();
            hideBanner();
        });
    }

});
