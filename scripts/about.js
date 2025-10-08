async function loadContentfulContent() {
    try {
        console.log('Starting to load Contentful content at', new Date().toLocaleString('en-ZA'));
        
        if (!window.contentfulService) {
            console.error('Contentful service not available');
            setTimeout(loadContentfulContent, 100);
            return;
        }

        const [
            heroSection,
            focusAreas,
            climateRisks,
            climateResponses,
            partnerLogos,
            newsletterSection
        ] = await Promise.all([
            window.contentfulService.getHeroSection(),
            window.contentfulService.getFocusAreas(),
            window.contentfulService.getClimateRisks(),
            window.contentfulService.getClimateResponses(),
            window.contentfulService.getPartnerLogos(),
            window.contentfulService.getNewsletterSection()
        ]);

        console.log('Contentful data loaded successfully');
        console.log('Climate risks data structure:', JSON.stringify(climateRisks, null, 2));

        renderHeroSection(heroSection);
        renderFocusAreas(focusAreas);
        await renderClimateRisks(climateRisks);
        renderClimateResponses(climateResponses);
        renderPartnerLogos(partnerLogos);
        renderNewsletterSection(newsletterSection);

    } catch (error) {
        console.error('Error loading Contentful content:', error);
        renderStaticContent();
    }
}

function renderHeroSection(heroData) {
    console.log('Rendering hero section with data:', heroData);
    if (!heroData || !heroData.fields) return;
    const heroTitle = document.getElementById('hero-title');
    const heroDescription = document.getElementById('hero-description');
    const heroImage = document.querySelector('.hero-image img');

    if (heroTitle && heroData.fields.title) heroTitle.textContent = heroData.fields.title;
    if (heroDescription && heroData.fields.description) heroDescription.textContent = heroData.fields.description;
    if (heroImage && heroData.fields.imageAlt) heroImage.alt = heroData.fields.imageAlt;
    console.log('Hero section rendered successfully');
}

function renderFocusAreas(focusAreas) {
    console.log('Rendering focus areas with data:', focusAreas);
    if (!focusAreas || focusAreas.length === 0) return;
    const container = document.getElementById('about-priority-areas');
    if (!container) return;

    container.innerHTML = '';
    focusAreas.forEach((area, index) => {
        const card = document.createElement('div');
        card.className = 'focus-item';
        if (area.fields.backgroundImageUrl) card.style.backgroundImage = `url('${area.fields.backgroundImageUrl}')`;
        card.onclick = () => navigateToFocusArea(area.fields.slug || area.fields.title.toLowerCase().replace(/\s+/g, '-'));
        card.innerHTML = `<div class="focus-content"><h3>${area.fields.title || 'Untitled'}</h3></div>`;
        container.appendChild(card);
    });
    console.log('Focus areas rendered:', focusAreas.length);
}

async function renderClimateRisks(climateRisks) {
    console.log('Rendering climate risks with data:', climateRisks);
    if (!climateRisks || climateRisks.length === 0) return;
    const container = document.getElementById('climate-risks-grid');
    if (!container) return;

    container.innerHTML = '';

    const riskItems = [
        { risk: climateRisks[0], col: 1, row: 1 }, // Physical damage
        { risk: climateRisks[1], col: 2, row: 1 }, // Operating costs
        { risk: climateRisks[2], col: 3, row: 1 }, // Supply chain
        { risk: climateRisks[3], col: 1, row: 2, span: 2 }, // Reputational risk
        { risk: climateRisks[4], col: 3, row: 2 }  // Regulatory risk
    ];

    for (const item of riskItems) {
        const riskDiv = document.createElement('div');
        riskDiv.className = 'climate-risk-item';

        let iconUrl = '';
        try {
            const iconImage = item.risk.fields.iconImage;
            if (iconImage && iconImage['en-US']) {
                const link = iconImage['en-US'];
                if (link.sys && link.sys.type === 'Link' && link.sys.linkType === 'Asset') {
                    const assetId = link.sys.id;
                    console.log(`Attempting to fetch asset with ID: ${assetId} for ${item.risk.fields.title}`);
                    const asset = await window.contentfulService.getAsset(assetId);
                    if (!asset || !asset.fields) {
                        console.error(`Asset ${assetId} not found or incomplete for ${item.risk.fields.title}`);
                    } else {
                        console.log(`Asset fetched for ${item.risk.fields.title}:`, asset);
                        iconUrl = asset.fields.file?.url ? `https:${asset.fields.file.url}` : '';
                        if (!iconUrl) console.warn(`No file.url in asset ${assetId} for ${item.risk.fields.title}`);
                    }
                } else if (link.fields && link.sys && link.sys.type === 'Asset') {
                    console.log(`Using included asset for ${item.risk.fields.title}:`, link);
                    iconUrl = link.fields.file?.url ? `https:${link.fields.file.url}` : '';
                    if (!iconUrl) console.warn(`No file.url in included asset for ${item.risk.fields.title}`);
                } else {
                    console.warn(`Unexpected iconImage structure for ${item.risk.fields.title}:`, link);
                }
            } else if (iconImage && Object.keys(iconImage).length > 0) {
                const locale = Object.keys(iconImage)[0];
                const link = iconImage[locale];
                if (link.sys && link.sys.type === 'Link' && link.sys.linkType === 'Asset') {
                    const assetId = link.sys.id;
                    console.log(`Using alternate locale ${locale} for asset ID: ${assetId} for ${item.risk.fields.title}`);
                    const asset = await window.contentfulService.getAsset(assetId);
                    if (!asset || !asset.fields) {
                        console.error(`Asset ${assetId} not found or incomplete for ${item.risk.fields.title}`);
                    } else {
                        console.log(`Asset fetched for ${item.risk.fields.title}:`, asset);
                        iconUrl = asset.fields.file?.url ? `https:${asset.fields.file.url}` : '';
                        if (!iconUrl) console.warn(`No file.url in asset ${assetId} for ${item.risk.fields.title}`);
                    }
                }
            } else {
                console.warn(`No valid iconImage data found for ${item.risk.fields.title}`);
            }
        } catch (error) {
            console.error(`Failed to fetch asset for ${item.risk.fields.title}:`, error.message);
        }

        const iconHtml = iconUrl
            ? `<img src="${iconUrl}" style="width: 80px; height: 80px; margin-right: 8px;" alt="${item.risk.fields.title} icon">`
            : ''; // No ⚠️ fallback

        riskDiv.innerHTML = `
            <div>
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    ${iconHtml}
                    <h3 style="font-size: min(20px, 2.2vw); margin: 0; font-weight: 600;">${item.risk.fields.title || 'Untitled Risk'}</h3>
                </div>
                <p style="font-size: min(15px, 1.6vw); line-height: 1.3; margin: 0;">${item.risk.fields.description || 'No description available'}</p>
            </div>
        `;
        container.appendChild(riskDiv);
    }
    console.log('Climate risks rendered:', climateRisks.length);
}

function renderClimateResponses(climateResponses) {
    console.log('Rendering climate responses with data:', climateResponses);
    if (!climateResponses || climateResponses.length === 0) return;
    const container = document.getElementById('climate-responses-container');
    if (!container) return;

    container.innerHTML = '';
    const topGrid = document.createElement('div');
    topGrid.className = 'climate-response-grid';
    const bottomGrid = document.createElement('div');
    bottomGrid.className = 'climate-response-grid';

    climateResponses.forEach((response, index) => {
        const responseDiv = document.createElement('div');
        responseDiv.className = 'climate-response-card';
        responseDiv.style.background = response.fields.backgroundColor || '#009381';
        responseDiv.innerHTML = `
            <div class="climate-response-image" style="background-image: url('${response.fields.backgroundImageUrl || ''}')"></div>
            <div class="climate-response-content">
                <h3 style="font-size: 22px; margin-top: 0; margin-bottom: 15px; font-weight: 600;">${response.fields.title || 'Untitled Response'}</h3>
                <p style="font-size: 16px; line-height: 1.6;">${response.fields.description || 'No description available'}</p>
            </div>
        `;
        if (index < 2) topGrid.appendChild(responseDiv);
        else bottomGrid.appendChild(responseDiv);
    });

    container.appendChild(topGrid);
    container.appendChild(bottomGrid);
    console.log('Climate responses rendered:', climateResponses.length);
}

function renderPartnerLogos(partnerLogos) {
    console.log('Rendering partner logos with data:', partnerLogos);
    if (!partnerLogos || partnerLogos.length === 0) return;
    const container = document.getElementById('partners-container');
    if (!container) return;

    container.innerHTML = '';
    partnerLogos.forEach((partner, index) => {
        const img = document.createElement('img');
        img.src = partner.fields.logoUrl;
        img.alt = partner.fields.altText || 'Partner logo';
        img.className = 'partner-logo';
        container.appendChild(img);
    });
    console.log('Partner logos rendered:', partnerLogos.length);
}

function renderNewsletterSection(newsletterData) {
    console.log('Rendering newsletter section with data:', newsletterData);
    if (!newsletterData || !newsletterData.fields) return;
    const title = document.getElementById('newsletter-title');
    const emailInput = document.getElementById('newsletter-email');
    const submitButton = document.getElementById('newsletter-submit');
    const note = document.getElementById('newsletter-note');

    if (title && newsletterData.fields.title) title.textContent = newsletterData.fields.title;
    if (emailInput && newsletterData.fields.emailPlaceholder) emailInput.placeholder = newsletterData.fields.emailPlaceholder;
    if (submitButton && newsletterData.fields.submitTitle) submitButton.title = newsletterData.fields.submitTitle;
    if (note && newsletterData.fields.note) note.textContent = newsletterData.fields.note;
    console.log('Newsletter section rendered');
}

function renderStaticContent() {
    console.log('Rendering static content as fallback');
    const heroData = { fields: { title: "ABOUT THE GREEN ECONOMY", description: "A green economy is one which is socially inclusive and environmentally sustainable...", imageAlt: "Professional woman in safety vest" } };
    const priorityAreas = [{ title: "Agriculture", image: "https://images.unsplash.com/photo-1472396961693-142e6e269027", overlay: "Agriculture" }, /* ... other areas ... */];
    const climateRisks = [
        { fields: { iconImage: { 'en-US': { fields: { file: { url: '/1RnW1nTnR3w7RLvPq4ftcr/39c3d11bf1a349b601bea223402f32b3/riskofphysicaldamage.png' } } } }, title: "Risk of physical damage to structures", description: "Climate change poses significant threats..." } },
        { fields: { iconImage: { 'en-US': { fields: { file: { url: '/4WxESDfZ0jVFKzyK6OjB4K/18b123cc76b2bc5e737d516b7b7b1185/riskofincreasedoperatingcosts.png' } } } }, title: "Risk of increased operating costs", description: "As climate impacts intensify..." } },
        { fields: { iconImage: { 'en-US': { fields: { file: { url: '/1KXQFQo7FfcEQbXaQzlTE4/[insert-hash-here]/riskofsupplychain.png' } } } }, title: "Risk of supply chain disruptions", description: "Climate-related events can severely impact..." } },
        { fields: { iconImage: { 'en-US': { fields: { file: { url: '/5a4OcDd7MYBVpKsnS3NOCH/c5bf907d14d362c0772d4dd24ce81a3f/reputationrisk.png' } } } }, title: "Reputational risk", description: "Consumer awareness and stakeholder expectations..." } },
        { fields: { iconImage: { 'en-US': { fields: { file: { url: '/3NE1YxJo9bKin4CiMC0LUP/55dafc10f991bd92321dd3a2a9b68f12/regulatoryrisk.png' } } } }, title: "Regulatory risk", description: "Evolving climate policies..." } }
    ];
    const responses = [{ title: "Adaptation", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158", description: "Building resilience..." }, /* ... other responses ... */];

    renderHeroSection(heroData);
    renderPriorityAreasStatic(priorityAreas);
    renderClimateRisksStatic(climateRisks);
    renderClimateResponsesStatic(responses);
}

function renderPriorityAreasStatic(areas) {
    const container = document.getElementById('about-priority-areas');
    if (!container) return;
    container.innerHTML = '';
    areas.forEach(area => {
        const card = document.createElement('div');
        card.className = 'focus-item';
        card.style.backgroundImage = `url('${area.image}')`;
        card.onclick = () => navigateToFocusArea(area.title.toLowerCase().replace(/\s+/g, '-'));
        card.innerHTML = `<div class="focus-content"><h3>${area.overlay}</h3></div>`;
        container.appendChild(card);
    });
}

function renderClimateRisksStatic(risks) {
    const container = document.getElementById('climate-risks-grid');
    if (!container) return;
    container.innerHTML = '';
    const riskItems = [
        { risk: risks[0], col: 1, row: 1 },
        { risk: risks[1], col: 2, row: 1 },
        { risk: risks[2], col: 3, row: 1 },
        { risk: risks[3], col: 1, row: 2, span: 2 },
        { risk: risks[4], col: 3, row: 2 }
    ];
    riskItems.forEach((item, index) => {
        const riskDiv = document.createElement('div');
        riskDiv.className = 'climate-risk-item';
        let iconUrl = '';
        if (item.risk.fields.iconImage && item.risk.fields.iconImage['en-US']) {
            const asset = item.risk.fields.iconImage['en-US'];
            iconUrl = asset.fields ? `https:${asset.fields.file.url}` : '';
        }
        const iconHtml = iconUrl
            ? `<img src="${iconUrl}" style="width: 80px; height: 80px; margin-right: 8px;" alt="${item.risk.fields.title} icon">`
            : ''; // No ⚠️ fallback
        riskDiv.innerHTML = `
            <div>
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    ${iconHtml}
                    <h3 style="font-size: min(20px, 2.2vw); margin: 0; font-weight: 600;">${item.risk.fields.title || 'Untitled Risk'}</h3>
                </div>
                <p style="font-size: min(15px, 1.6vw); line-height: 1.3; margin: 0;">${item.risk.description || 'No description available'}</p>
            </div>
        `;
        container.appendChild(riskDiv);
    });
}

function renderClimateResponsesStatic(responses) {
    const container = document.getElementById('climate-responses-container');
    if (!container) return;
    container.innerHTML = '';
    const topGrid = document.createElement('div');
    topGrid.className = 'climate-response-grid';
    const bottomGrid = document.createElement('div');
    bottomGrid.className = 'climate-response-grid';
    responses.forEach((response, index) => {
        const responseDiv = document.createElement('div');
        responseDiv.className = 'climate-response-card';
        responseDiv.style.background = '#009381';
        responseDiv.innerHTML = `
            <div class="climate-response-image" style="background-image: url('${response.image}')"></div>
            <div class="climate-response-content">
                <h3 style="font-size: 22px; margin-top: 0; margin-bottom: 15px; font-weight: 600;">${response.title}</h3>
                <p style="font-size: 16px; line-height: 1.6;">${response.description}</p>
            </div>
        `;
        if (index < 2) topGrid.appendChild(responseDiv);
        else bottomGrid.appendChild(responseDiv);
    });
    container.appendChild(topGrid);
    container.appendChild(bottomGrid);
}

function navigateToFocusArea(areaId) {
    window.location.href = `../Focus-Area/focus-area.html`;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing Contentful content loading at', new Date().toLocaleString('en-ZA'));
    setTimeout(loadContentfulContent, 500);
    document.querySelectorAll('a[href="/"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/index.html';
        });
    });
    document.querySelectorAll('a[href="about"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'about.html';
        });
    });
});