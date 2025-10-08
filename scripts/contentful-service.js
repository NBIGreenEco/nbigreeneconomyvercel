// Contentful Service for fetching content
const CONTENTFUL_SPACE_ID = 'zerelkd70urg';
const CONTENTFUL_ACCESS_TOKEN = '5YmyLiRoDo7XRXolU5C-UVgMRnf9I5FF_6zaN3iAjFs';
const CONTENTFUL_ENVIRONMENT = 'master';

class ContentfulService {
    constructor() {
        this.baseUrl = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}`;
        this.assetsCache = new Map();
    }

    async fetchContent(query) {
        try {
            const response = await fetch(`${this.baseUrl}${query}&access_token=${CONTENTFUL_ACCESS_TOKEN}`);
            if (!response.ok) {
                throw new Error(`Contentful API error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching from Contentful:', error);
            throw error;
        }
    }

    async getAllAssets() {
        try {
            console.log('Fetching all assets...');
            let allAssets = [];
            let skip = 0;
            const limit = 100;
            let hasMore = true;

            while (hasMore) {
                const response = await this.fetchContent(`/assets?skip=${skip}&limit=${limit}`);
                allAssets = allAssets.concat(response.items);
                skip += limit;
                hasMore = skip < response.total;
            }

            // Cache assets by their ID for quick lookup
            allAssets.forEach(asset => {
                if (asset.sys && asset.sys.id) {
                    this.assetsCache.set(asset.sys.id, asset);
                }
            });

            console.log(`Cached ${this.assetsCache.size} assets`);
            return allAssets;
        } catch (error) {
            console.error('Error fetching assets:', error);
            return [];
        }
    }

    async getHeroSection() {
        const query = '/entries?content_type=heroSection&limit=1';
        const data = await this.fetchContent(query);
        // Return the processed entry, not just fields
        return data.items[0] ? this.processEntry(data.items[0]) : null;
    }

    async getFocusAreas() {
        const query = '/entries?content_type=focusArea&order=fields.order';
        const data = await this.fetchContent(query);
        return data.items.map(item => this.processEntry(item)) || [];
    }

    async getClimateRisks() {
        const query = '/entries?content_type=climateRisk&order=fields.order';
        const data = await this.fetchContent(query);
        return data.items.map(item => this.processEntry(item)) || [];
    }

    async getClimateResponses() {
        const query = '/entries?content_type=climateResponse&order=fields.order';
        const data = await this.fetchContent(query);
        return data.items.map(item => this.processEntry(item)) || [];
    }

    async getPartnerLogos() {
        const query = '/entries?content_type=partnerLogo&order=fields.order';
        const data = await this.fetchContent(query);
        return data.items.map(item => this.processEntry(item)) || [];
    }

    async getNewsletterSection() {
        const query = '/entries?content_type=newsletterSection&limit=1';
        const data = await this.fetchContent(query);
        return data.items[0] ? this.processEntry(data.items[0]) : null;
    }



    // Add these methods to your existing ContentfulService class

async getKnowledgeHubHero() {
    const query = '/entries?content_type=knowledgeHubHero&limit=1';
    const data = await this.fetchContent(query);
    return data.items[0] ? this.processEntry(data.items[0]) : null;
}

async getKnowledgeHubSections() {
    const query = '/entries?content_type=knowledgeHubSection&order=fields.order';
    const data = await this.fetchContent(query);
    return data.items.map(item => this.processEntry(item)) || [];
}

async getKnowledgeHubPartners() {
    const query = '/entries?content_type=knowledgeHubPartner&order=fields.order';
    const data = await this.fetchContent(query);
    return data.items.map(item => this.processEntry(item)) || [];
}

async getKnowledgeHubNewsletter() {
    const query = '/entries?content_type=knowledgeHubNewsletter&limit=1';
    const data = await this.fetchContent(query);
    return data.items[0] ? this.processEntry(data.items[0]) : null;
}

// Add these methods to your existing ContentfulService class

async getOpportunitiesHero() {
    const query = '/entries?content_type=opportunitiesHero&limit=1';
    const data = await this.fetchContent(query);
    return data.items[0] ? this.processEntry(data.items[0]) : null;
}

async getOpportunityCards() {
    const query = '/entries?content_type=opportunityCard&order=fields.order';
    const data = await this.fetchContent(query);
    return data.items.map(item => this.processEntry(item)) || [];
}

async getOpportunitiesPartners() {
    const query = '/entries?content_type=opportunitiesPartner&order=fields.order';
    const data = await this.fetchContent(query);
    return data.items.map(item => this.processEntry(item)) || [];
}

async getOpportunitiesNewsletter() {
    const query = '/entries?content_type=opportunitiesNewsletter&limit=1';
    const data = await this.fetchContent(query);
    return data.items[0] ? this.processEntry(data.items[0]) : null;
}

    processEntry(entry) {
        if (!entry || !entry.fields) return entry;
        
        const processedFields = {};
        
        // Process each field
        Object.keys(entry.fields).forEach(fieldName => {
            const fieldValue = entry.fields[fieldName];
            
            // Check if the field has locale-specific data
            if (fieldValue && typeof fieldValue === 'object' && fieldValue['en-US'] !== undefined) {
                // Handle asset references
                if (fieldValue['en-US'].sys && fieldValue['en-US'].sys.type === 'Link' && fieldValue['en-US'].sys.linkType === 'Asset') {
                    const assetId = fieldValue['en-US'].sys.id;
                    const asset = this.assetsCache.get(assetId);
                    
                    if (asset && asset.fields && asset.fields.file && asset.fields.file['en-US']) {
                        processedFields[fieldName] = `https:${asset.fields.file['en-US'].url}`;
                    } else {
                        processedFields[fieldName] = fieldValue['en-US'];
                    }
                } else {
                    processedFields[fieldName] = fieldValue['en-US'];
                }
            } else {
                // Direct field value (no locale nesting)
                processedFields[fieldName] = fieldValue;
            }
        });

        return {
            ...entry,
            fields: processedFields
        };
    }

    // Initialize by fetching all assets first
    async initialize() {
        await this.getAllAssets();
        console.log('Contentful service initialized with assets cache');
    }
}

// Create global instance and initialize
window.contentfulService = new ContentfulService();
window.contentfulService.initialize().then(() => {
    console.log('Contentful service ready');
}).catch(error => {
    console.error('Failed to initialize Contentful service:', error);
});


