    // ==================== UTILS ====================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ==================== NAVIGATION ====================
const navBtns = $$('.nav-btn');
const pages = $$('.page');

navBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const targetPage = this.getAttribute('data-page');
        const targetElement = $(`#${targetPage}`);
        
        if (!targetElement) return; // Sécurité : stop si la page existe pas
        
        navBtns.forEach(b => {
            b.classList.remove('active');
            b.removeAttribute('aria-current');
        });
        
        $$(`[data-page="${targetPage}"]`).forEach(b => {
            b.classList.add('active');
            b.setAttribute('aria-current', 'page');
        });
        
        pages.forEach(page => page.classList.remove('active'));
        targetElement.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll
    });
});

// ==================== FILTRE GALERIE ====================
const filterBtns = $$('.filter-btn');
const galleryCards = $$('.card');
filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        filterBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-pressed', 'true');
        
        const filterValue = this.getAttribute('data-filter');
        
        // Animation fade au lieu de display brutal
        galleryCards.forEach(card => {
            const match = filterValue === 'all' || card.getAttribute('data-category') === filterValue;
            card.style.transition = 'opacity 0.3s, transform 0.3s';
            card.style.opacity = match ? '1' : '0';
            card.style.transform = match ? 'scale(1)' : 'scale(0.8)';
            card.setAttribute('aria-hidden', !match);
            
            setTimeout(() => {
                card.style.display = match ? 'block' : 'none';
            }, 300);
        });
    });
});

// ==================== LIGHTBOX ====================
const lightbox = $('#lightbox');
const lightboxImg = $('#lightbox-img');
const lightboxClose = $('#lightbox-close');
let lastFocusedElement = null; // Mémorise où était le focus

$$('.card img').forEach(img => {
    const openLightbox = () => {
        lastFocusedElement = document.activeElement; // Sauvegarde focus
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || "Photo Julien André";
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Bloque scroll du fond
        lightboxClose.focus();
    };
    
    img.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox();
    });
    
    // Accessibilité clavier
    img.parentElement.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox();
        }
    });
});

const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Remet le scroll
    if(lastFocusedElement) lastFocusedElement.focus(); // Remet le focus
};

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
    if(e.target === lightbox) closeLightbox();
});

// Fermer avec Echap
document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
    }
});

// ==================== DATE MIN = AUJOURD'HUI ====================
const dateInput = $('#date');
if(dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
}

// ==================== VALIDATION WHATSAPP ====================
const setupWhatsAppValidation = (inputId, isForm = false) => {
    const input = $(`#${inputId}`);
    if(!input) return;
    
    input.addEventListener('input', function() {
        const errorEl = $(`#${inputId}-error`);
        if (this.validity.patternMismatch) {
            if(errorEl) errorEl.style.display = 'block';
            if(isForm) this.style.borderColor = '#e74c3c';
        } else {
            if(errorEl) errorEl.style.display = 'none';
            if(isForm) this.style.borderColor = this.value ? '#4caf50' : '#ddd';
        }
    });
};

setupWhatsAppValidation('whatsapp');
setupWhatsAppValidation('whatsappForm', true); // DRY : évite duplication

// ============================================
// FONCTION GENERIQUE POUR FORMULAIRES
// ============================================

function handleFormSubmit(formId, callback) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Récupérer les données du formulaire
        const data = new FormData(e.target);
        
        // Construire le message avec le callback
        const message = callback(data);
        
        // Votre numéro WhatsApp (sans le 0, avec indicatif 243)
        const numero = "243992126727";
        
        // Encoder le message pour l'URL
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
        
        // Ouvrir WhatsApp
        window.open(url, '_blank');
        
        // Message de confirmation
        alert('✅ Demande préparée ! Redirection vers WhatsApp.');
        
        // Optionnel : réinitialiser le formulaire
        // e.target.reset();
    });
}


// ==================== SCROLL TO TOP ====================
const scrollTopBtn = $('#scrollTop');
if(scrollTopBtn) {
    // Throttle pour perf : évite de spam l'event scroll
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
                ticking = false;
            });
            ticking = true;
        }
    });
    
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    scrollTopBtn.addEventListener('click', scrollToTop);
    scrollTopBtn.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToTop();
        }
    });
}

// ==================== ANIMATION AU SCROLL ====================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('zoom-in');
            observer.unobserve(entry.target); // Stop observer après anim = perf
        }
    });
}, { threshold: 0.1 });

$$('.card, .testimonial-card, .money-card').forEach((el) => observer.observe(el));

// ==================== DARK MODE ====================
function initDarkMode() {
    const darkModeToggle = $('#darkModeToggle');
    if (!darkModeToggle) return;
    
    const updateButton = (isDark) => {
        darkModeToggle.innerHTML = isDark ? '☀️ Mode clair' : '🌙 Mode sombre';
        darkModeToggle.setAttribute('aria-label', isDark ? 'Basculer en mode clair' : 'Basculer en mode sombre');
    };
    
    // Gère le cas où l'user préfère dark mode système
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let darkActive = localStorage.getItem('darkMode');
    darkActive = darkActive !== null ? darkActive === 'true' : prefersDark;
    
    if (darkActive) document.body.classList.add('dark-mode');
    updateButton(darkActive);
    
    darkModeToggle.addEventListener('click', function() {
        const isDark = document.body.classList.toggle('dark-mode');
        updateButton(isDark);
        try {
            localStorage.setItem('darkMode', isDark);
        } catch(e) {}
    });
}

initDarkMode();

// ============================================
// CODE POUR LES FORMULAIRES UNIQUEMENT
// À AJOUTER À LA FIN DE VOTRE FICHIER script.js
// ============================================

// Formulaire de réservation
const formReservation = document.getElementById('formReservation');
if (formReservation) {
    formReservation.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Récupérer les valeurs
        const nom = document.getElementById('nom').value;
        const whatsapp = document.getElementById('whatsapp').value;
        const insta = document.getElementById('insta').value;
        const facebook = document.getElementById('facebook').value;
        const date = document.getElementById('date').value;
        const ceremonie = document.getElementById('ceremonie').value;
        const details = document.getElementById('details').value;
        
        // Vérifications
        if (!nom || !whatsapp || !date || !ceremonie) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        // Construire le message
        let message = `*📸 NOUVELLE RÉSERVATION*%0A%0A`;
        message += `*Nom:* ${nom}%0A`;
        message += `*WhatsApp:* ${whatsapp}%0A`;
        if (insta) message += `*Insta:* ${insta}%0A`;
        if (facebook) message += `*Facebook:* ${facebook}%0A`;
        message += `*Date:* ${date}%0A`;
        message += `*Type:* ${ceremonie}%0A`;
        message += `*Détails:* ${details || 'Aucun'}%0A%0A`;
        message += `_Merci de confirmer la disponibilité_`;
        
        // Envoyer
        window.open(`https://wa.me/243992126727?text=${message}`, '_blank');
    });
}

// Formulaire de formation
const formFormation = document.getElementById('formFormation');
if (formFormation) {
    formFormation.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Récupérer les valeurs
        const nom = document.getElementById('nomForm').value;
        const whatsapp = document.getElementById('whatsappForm').value;
        const pack = document.getElementById('packForm').value;
        const motivation = document.getElementById('motivation').value;
        
        // Vérifications
        if (!nom || !whatsapp || !pack) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        // Construire le message
        let message = `*🎓 DEMANDE FORMATION PHOTO*%0A%0A`;
        message += `*Nom:* ${nom}%0A`;
        message += `*WhatsApp:* ${whatsapp}%0A`;
        message += `*Pack:* ${pack}%0A`;
        if (motivation) message += `*Motivation:* ${motivation}`;
        
        // Envoyer
        window.open(`https://wa.me/243992126727?text=${message}`, '_blank');
    });
}


