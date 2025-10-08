// Contentful content loading and rendering for Knowledge Hub
async function loadKnowledgeHubContent() {
    try {
        console.log('Starting to load Knowledge Hub content...');
        
        // Wait for Contentful service to be ready
        if (!window.contentfulService) {
            console.error('Contentful service not available');
            setTimeout(loadKnowledgeHubContent, 100);
            return;
        }

        // Load all content in parallel
        const [
            heroSection,
            hubSections,
            hubPartners,
            hubNewsletter
        ] = await Promise.all([
            window.contentfulService.getKnowledgeHubHero(),
            window.contentfulService.getKnowledgeHubSections(),
            window.contentfulService.getKnowledgeHubPartners(),
            window.contentfulService.getKnowledgeHubNewsletter()
        ]);

        console.log('Knowledge Hub data loaded successfully');
        
        // Render the content
        renderKnowledgeHubHero(heroSection);
        renderKnowledgeHubSections(hubSections);
        renderKnowledgeHubPartners(hubPartners);
        renderKnowledgeHubNewsletter(hubNewsletter);

    } catch (error) {
        console.error('Error loading Knowledge Hub content:', error);
        // Fallback to static content
        renderKnowledgeHubStaticContent();
    }
}

function renderKnowledgeHubHero(heroData) {
    console.log('Rendering knowledge hub hero with data:', heroData);
    
    if (!heroData || !heroData.fields) {
        console.log('No hero section data found');
        return;
    }
    
    const heroTitle = document.querySelector('.hero-text h1');
    const heroImage = document.querySelector('.hero-img');

    if (heroTitle && heroData.fields.title) {
        heroTitle.textContent = heroData.fields.title;
    }
    
    if (heroImage && heroData.fields.imageUrl) {
        heroImage.src = heroData.fields.imageUrl;
        heroImage.alt = heroData.fields.imageAlt || 'Knowledge Hub Hero Image';
    }
}

function renderKnowledgeHubSections(sections) {
    console.log('Rendering knowledge hub sections with data:', sections);
    
    if (!sections || sections.length === 0) {
        console.log('No sections data found');
        return;
    }

    // Render each section based on its type
    sections.forEach((section, index) => {
        const sectionType = section.fields.sectionType || '';
        let container;
        
        switch(sectionType) {
            case 'learning':
                container = document.querySelector('.first-section');
                break;
            case 'business':
                container = document.querySelector('.news-header');
                break;
            case 'market':
                container = document.querySelector('.section3');
                break;
            default:
                console.log('Unknown section type:', sectionType);
                return;
        }

        if (!container) {
            console.error(`Container for section type ${sectionType} not found`);
            return;
        }

        // Update section content
        const title = container.querySelector('h2');
        const description = container.querySelector('.rect-text');
        const button = container.querySelector('.reg-button, .rect-button');

        if (title && section.fields.title) {
            title.textContent = section.fields.title;
        }
        
        if (description && section.fields.description) {
            description.textContent = section.fields.description;
        }
        
        if (button && section.fields.buttonText) {
            button.textContent = section.fields.buttonText;
            if (section.fields.buttonLink) {
                button.onclick = () => window.location.href = section.fields.buttonLink;
            }
        }

        // Update background color if specified
        if (section.fields.backgroundColor) {
            container.style.backgroundColor = section.fields.backgroundColor;
        }
    });
}

function renderKnowledgeHubPartners(partners) {
    console.log('Rendering knowledge hub partners with data:', partners);
    
    if (!partners || partners.length === 0) {
        console.log('No partners data found');
        return;
    }

    const container = document.querySelector('.partners-content');
    if (!container) {
        console.error('Partners container not found');
        return;
    }

    container.innerHTML = '';

    partners.forEach(partner => {
        const img = document.createElement('img');
        img.src = partner.fields.logoUrl;
        img.alt = partner.fields.altText || partner.fields.name || 'Partner logo';
        img.className = 'partner-logo';
        container.appendChild(img);
    });
}

function renderKnowledgeHubNewsletter(newsletterData) {
    console.log('Rendering knowledge hub newsletter with data:', newsletterData);
    
    if (!newsletterData || !newsletterData.fields) {
        console.log('No newsletter data found');
        return;
    }

    const title = document.querySelector('.login-section h2');
    const emailInput = document.querySelector('.login-section input[type="email"]');
    const submitButton = document.querySelector('.login-section button[type="submit"]');
    const note = document.querySelector('.login-section p');

    if (title && newsletterData.fields.title) {
        title.textContent = newsletterData.fields.title;
    }
    
    if (emailInput && newsletterData.fields.emailPlaceholder) {
        emailInput.placeholder = newsletterData.fields.emailPlaceholder;
    }
    
    if (submitButton && newsletterData.fields.submitTitle) {
        submitButton.title = newsletterData.fields.submitTitle;
    }
    
    if (note && newsletterData.fields.note) {
        note.textContent = newsletterData.fields.note;
    }
}

function renderKnowledgeHubStaticContent() {
    console.log('Rendering static knowledge hub content as fallback');
    // Fallback content would go here
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing Knowledge Hub content loading');
    setTimeout(loadKnowledgeHubContent, 500);
});