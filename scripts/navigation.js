document.addEventListener('DOMContentLoaded', function() {
    // Hero buttons
    const heroButtons = document.querySelectorAll('.hero-button');
    heroButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim().toLowerCase();
            const translatedLogin = i18next.t('buttons.login').toLowerCase();
            switch(buttonText) {
                case 'get funding':
                    window.location.href = '/Funding Hub/Funding-Hub.html';
                    break;
                case 'opportunities':
                    window.location.href = '/LandingPage/Opportunities/opportunities.html';
                    break;
                case 'irm sector':
                    window.location.href = '/LandingPage/IRM-Sector/IRMSector.html';
                    break;
                case translatedLogin: // Dynamic check for translated "Sign in to Dashboard"
                    window.location.href = '/LandingPage/SignInAndSignUp/SignIn.html';
                    break;
            }
        });
    });

    // Update footer links
    const footerLinks = {
        'green_economy_network': '#',
        'live_events_calendar': '#',
        'green_opportunities': '/LandingPage/Opportunities/opportunities.html',
        'news_updates': '#',
        'news_events': '#',
        'contact_us': '/LandingPage/About Page/about.html#contact',
        'terms_reference': '#'
    };

    Object.entries(footerLinks).forEach(([key, url]) => {
        const elements = document.querySelectorAll(`[data-i18n$="${key}"]`);
        elements.forEach(el => {
            const anchor = el.closest('a');
            if (anchor) {
                anchor.href = url;
            }
        });
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                if (history.pushState) {
                    history.pushState(null, null, href);
                } else {
                    location.hash = href;
                }
            }
        });
    });

    // Handle back/forward navigation for anchor links
    window.addEventListener('popstate', function(e) {
        const hash = window.location.hash;
        if (hash) {
            const target = document.querySelector(hash);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});