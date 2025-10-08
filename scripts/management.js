#!/usr/bin/env node

require("dotenv").config();
const contentful = require("contentful-management");

// Contentful configuration
const CONTENTFUL_CONFIG = {
    spaceId: 'zerelkd70urg',
    accessToken: 'CFPAT-DTSYl7wEj1X0Vp1CZUrd3sDTS8hEFi_UprYYVEsmO6k',
    environment: 'master'
};

// Content type definitions
const CONTENT_TYPES = {
    heroSection: {
        id: 'heroSection',
        name: 'Hero Section',
        fields: [
            { id: 'title', name: 'Title', type: 'Symbol' },
            { id: 'description', name: 'Description', type: 'Text' },
            { id: 'imageAlt', name: 'Image Alt Text', type: 'Symbol' }
        ]
    },
    focusArea: {
        id: 'focusArea',
        name: 'Focus Area',
        fields: [
            { id: 'title', name: 'Title', type: 'Symbol' },
            { id: 'slug', name: 'Slug', type: 'Symbol' },
            { id: 'backgroundImageUrl', name: 'Background Image URL', type: 'Symbol' },
            { id: 'order', name: 'Display Order', type: 'Integer' }
        ]
    },
    climateRisk: {
        id: 'climateRisk',
        name: 'Climate Risk',
        fields: [
            { id: 'title', name: 'Title', type: 'Symbol' },
            { id: 'description', name: 'Description', type: 'Text' },
            { id: 'icon', name: 'Icon', type: 'Symbol' },
            { id: 'order', name: 'Display Order', type: 'Integer' }
        ]
    },
    climateResponse: {
        id: 'climateResponse',
        name: 'Climate Response',
        fields: [
            { id: 'title', name: 'Title', type: 'Symbol' },
            { id: 'description', name: 'Description', type: 'Text' },
            { id: 'backgroundImageUrl', name: 'Background Image URL', type: 'Symbol' },
            { id: 'backgroundColor', name: 'Background Color', type: 'Symbol' },
            { id: 'order', name: 'Display Order', type: 'Integer' }
        ]
    },
    partnerLogo: {
        id: 'partnerLogo',
        name: 'Partner Logo',
        fields: [
            { id: 'name', name: 'Partner Name', type: 'Symbol' },
            { id: 'logoUrl', name: 'Logo URL', type: 'Symbol' },
            { id: 'altText', name: 'Alt Text', type: 'Symbol' },
            { id: 'order', name: 'Display Order', type: 'Integer' }
        ]
    },
    newsletterSection: {
        id: 'newsletterSection',
        name: 'Newsletter Section',
        fields: [
            { id: 'title', name: 'Title', type: 'Symbol' },
            { id: 'emailPlaceholder', name: 'Email Placeholder', type: 'Symbol' },
            { id: 'submitTitle', name: 'Submit Button Title', type: 'Symbol' },
            { id: 'note', name: 'Note Text', type: 'Symbol' }
        ]
    }
};

// Sample content data with actual Contentful asset URLs
const SAMPLE_CONTENT = {
    heroSection: {
        title: 'ABOUT THE GREEN ECONOMY',
        description: 'A green economy is one which is socially inclusive and environmentally sustainable. It improves human well-being and builds social equity while reducing environmental risks and ecological scarcities. In simple terms, we can think of a green economy as one which is low carbon, resource efficient and socially inclusive.',
        imageAlt: 'Professional woman in safety vest'
    },
    focusAreas: [
        { title: 'Agriculture', slug: 'agriculture', backgroundImageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&h=900&fit=crop', order: 1 },
        { title: 'Energy (clean and efficient)', slug: 'energy', backgroundImageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1600&h=900&fit=crop', order: 2 },
        { title: 'Natural resource conservation and management (including mining)', slug: 'natural-resource', backgroundImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&h=900&fit=crop', order: 3 },
        { title: 'Sustainable transport and infrastructure', slug: 'transport', backgroundImageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&h=900&fit=crop', order: 4 },
        { title: 'Environmental sustainability, including tourism education', slug: 'environmental', backgroundImageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1600&h=900&fit=crop', order: 5 },
        { title: 'Green buildings and the built environment', slug: 'buildings', backgroundImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1600&h=900&fit=crop', order: 6 },
        { title: 'Sustainable waste management and recycling', slug: 'waste', backgroundImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop', order: 7 },
        { title: 'Water management', slug: 'water', backgroundImageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&h=900&fit=crop', order: 8 },
        { title: 'Sustainable production and consumption', slug: 'production', backgroundImageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1600&h=900&fit=crop', order: 9 }
    ],
    climateRisks: [
        {
            icon: '⚠️',
            title: 'Risk of physical damage to structures',
            description: 'Climate change poses significant threats to infrastructure through extreme weather events, rising sea levels, and temperature fluctuations. Buildings, roads, and critical facilities face increased vulnerability to flooding, storms, and heat stress, requiring adaptive design and resilient construction practices.',
            order: 1
        },
        {
            icon: '📊',
            title: 'Risk of increased operating costs',
            description: 'As climate impacts intensify, businesses face higher operational expenses through increased energy costs, supply chain disruptions, and the need for climate adaptation measures. These rising costs affect competitiveness and long-term sustainability of operations across all sectors.',
            order: 2
        },
        {
            icon: '⛔',
            title: 'Risk of supply chain disruptions',
            description: 'Climate-related events can severely impact global and local supply chains, causing delays, shortages, and increased costs. Extreme weather, droughts, and floods disrupt transportation networks and production facilities, highlighting the need for resilient supply chain strategies.',
            order: 3
        },
        {
            icon: '⚖️',
            title: 'Regulatory risk',
            description: 'Evolving climate policies and regulations create compliance challenges and potential financial penalties. Organizations must navigate changing environmental standards, carbon pricing mechanisms, and disclosure requirements while adapting their operations to meet new regulatory frameworks.',
            order: 4
        },
        {
            icon: '📋',
            title: 'Reputational risk',
            description: 'Consumer awareness and stakeholder expectations around climate action continue to rise. Organizations face reputational damage if they fail to demonstrate meaningful environmental commitment, potentially affecting brand value, customer loyalty, and investment attractiveness in an increasingly climate-conscious market.',
            order: 5
        }
    ],
    climateResponses: [
        {
            title: 'Adaptation',
            description: 'Adaptation means keeping abreast of and staying ready to adapt to changes caused by climate change. It\'s about making plans and changes to deal with events like droughts or floods that might happen more often because of climate change. An example: farmers in South Africa are changing the way in which they harvest and grow crops in order to use less water, due to a decrease in rainfall. This is an example of adapting to the changing climate.',
            backgroundImageUrl: 'https://images.ctfassets.net/zerelkd70urg/2STh8vH2T37ZAHOgXIAJN6/18856a632f716a8b9f2a9bbc6b972b14/adaptation.webp',
            backgroundColor: '#009381',
            order: 1
        },
        {
            title: 'Mitigation',
            description: 'Mitigation means trying to stop or reduce activities that make climate change worse. This may include reducing gas emissions that come from burning coal or oil, which release large amounts of carbon dioxide into the atmosphere, in turn causing climate change through an increase in temperature by trapping heat in the atmosphere. An example: South Africa is building more wind and solar power plants to make electricity and generate alternative sources of energy without using as much coal, a fossil fuel. This aids in reducing the gases that cause climate change.',
            backgroundImageUrl: 'https://images.ctfassets.net/zerelkd70urg/AwREdOrcwEBSTEc6I0xRU/d39ff6a1a6157eb6da21caa5bd41f18c/Mitigation.webp',
            backgroundColor: '#20b04f',
            order: 2
        },
        {
            title: 'Climate finance',
            description: 'Climate finance refers to funds that help governments and organisations develop projects aimed at fighting climate change. These funds can be used to build and promote initiatives such as clean energy projects or to help communities prepare for climate impacts. An example: South Africa might get money from a global fund to build solar panels in a town. This contributes to clean energy and reduces the effects of climate change. Climate finance helps pay for such projects.',
            backgroundImageUrl: 'https://images.ctfassets.net/zerelkd70urg/1B8gkyNUKWYUNmXZCpPpD5/1fe750cddb84eb12bb1a75911a6531fc/climate.webp',
            backgroundColor: '#009381',
            order: 3
        },
        {
            title: 'Climate resilience',
            description: 'Climate resilience means being strong and ready to handle the problems that are caused by climate change. It\'s about making sure communities and nature can "bounce back" after climate change effects such as floods or storms. An example in South Africa: in areas where there is not much water, people might learn ways to save water and grow drought-resistant crops. This helps them survive and do well even when there is less rain due to a changing climate.',
            backgroundImageUrl: 'https://images.ctfassets.net/zerelkd70urg/4HnFg04g42FLR46xg8KndV/82093652af53d5d5172f6fc7970ac209/resilience.webp',
            backgroundColor: '#20b04f',
            order: 4
        }
    ],
    partnerLogos: [
        { name: 'GIZ', logoUrl: 'https://images.ctfassets.net/zerelkd70urg/5sm6u6ExK75tNaOp0sXW4Q/5f3f6b1ecf0d02881c2d1f49c9859802/giz-logo_2024-11-11-133203_nara.jpg', altText: 'GIZ Partner Logo', order: 1 },
        { name: 'SECO', logoUrl: 'https://images.ctfassets.net/zerelkd70urg/6Hy2lUewR8c1zygAgp3cPv/596ed9e891403d76aa7c9dae69e992e1/SECO-Logo.jpg', altText: 'SECO Partner Logo', order: 2 },
        { name: 'GDED', logoUrl: 'https://images.ctfassets.net/zerelkd70urg/CzrGQZGir0uRAfxuQYtB2/d203e88a4acbbd5d81a9d6367eab2dc3/GDED-Logo.jpg', altText: 'GDED Partner Logo', order: 3 },
        { name: 'LMS Platform', logoUrl: 'https://images.ctfassets.net/zerelkd70urg/1ZTqDOY47awcoyURx5Wyj0/dbca411dccbae3c3f3e9a2907caf916a/LMS-Platform-Logo.png', altText: 'LMS Platform Logo', order: 4 },
        { name: 'NBI', logoUrl: 'https://images.ctfassets.net/zerelkd70urg/3YBdfXxUtCBg4xmeH17dgF/f9d6db164d0b77e06ecd90ab10d9ca64/NBI-Logo.jpg', altText: 'NBI Partner Logo', order: 5 },
        { name: 'New Partner', logoUrl: 'https://images.ctfassets.net/zerelkd70urg/1ZTqDOY47awcoyURx5Wyj0/dbca411dccbae3c3f3e9a2907caf916a/LMS-Platform-Logo.png', altText: 'New Partner Logo', order: 6 }
    ],
    newsletterSection: {
        title: 'Subscribe to our newsletter to get the latest information',
        emailPlaceholder: 'Your email',
        submitTitle: 'Submit',
        note: '*Only relevant information, no spam'
    }
};

class ContentfulManager {
    constructor() {
        this.client = null;
        this.space = null;
        this.environment = null;
        this.assets = {}; // Cache for assets
    }

    async initialize() {
        console.log('Initializing Contentful client...');
        this.client = contentful.createClient({
            accessToken: CONTENTFUL_CONFIG.accessToken
        });

        this.space = await this.client.getSpace(CONTENTFUL_CONFIG.spaceId);
        this.environment = await this.space.getEnvironment(CONTENTFUL_CONFIG.environment);
        console.log('Contentful client initialized successfully');
    }

    async getAllAssets() {
        console.log('Fetching all assets...');
        try {
            const assets = await this.environment.getAssets();
            this.assets = {};
            
            assets.items.forEach(asset => {
                if (asset.fields && asset.fields.file && asset.fields.file['en-US']) {
                    const fileName = asset.fields.file['en-US'].fileName;
                    this.assets[fileName] = `https:${asset.fields.file['en-US'].url}`;
                }
            });
            
            console.log(`Found ${Object.keys(this.assets).length} assets`);
            console.log('Available assets:', Object.keys(this.assets));
            
            return this.assets;
        } catch (error) {
            console.log('Error fetching assets:', error.message);
            return {};
        }
    }

    async deleteAllEntries() {
        console.log('Deleting all existing entries (except media)...');
        
        try {
            const entries = await this.environment.getEntries({ limit: 1000 });
            console.log(`Found ${entries.items.length} entries to delete`);

            for (const entry of entries.items) {
                try {
                    // Skip if it's media content
                    if (entry.sys.contentType && 
                        (entry.sys.contentType.sys.id.includes('image') || 
                         entry.sys.contentType.sys.id.includes('video') ||
                         entry.sys.contentType.sys.id.includes('asset'))) {
                        console.log(`Skipping media entry: ${entry.sys.id}`);
                        continue;
                    }

                    // Unpublish first if published
                    if (entry.isPublished && entry.isPublished()) {
                        await entry.unpublish();
                        console.log(`Unpublished entry: ${entry.sys.id}`);
                    }
                    
                    // Delete the entry
                    await entry.delete();
                    console.log(`Deleted entry: ${entry.sys.id}`);
                    
                    // Small delay to avoid rate limits
                    await this.delay(200);
                } catch (error) {
                    console.log(`Could not delete entry ${entry.sys.id}: ${error.message}`);
                }
            }
            console.log('Entry deletion completed');
        } catch (error) {
            console.log('Error during entry deletion:', error.message);
        }
    }

    async deleteAllContentTypes() {
        console.log('Deleting all existing content types (except media)...');
        
        try {
            const contentTypes = await this.environment.getContentTypes();
            console.log(`Found ${contentTypes.items.length} content types`);

            for (const contentType of contentTypes.items) {
                try {
                    // Skip if it's media related
                    if (contentType.sys.id.includes('image') || 
                        contentType.sys.id.includes('video') ||
                        contentType.sys.id.includes('asset')) {
                        console.log(`Skipping media content type: ${contentType.sys.id}`);
                        continue;
                    }

                    // Unpublish first if published
                    if (contentType.isPublished && contentType.isPublished()) {
                        await contentType.unpublish();
                        console.log(`Unpublished content type: ${contentType.sys.id}`);
                    }
                    
                    // Delete the content type
                    await contentType.delete();
                    console.log(`Deleted content type: ${contentType.sys.id}`);
                    
                    await this.delay(500);
                } catch (error) {
                    console.log(`Could not delete content type ${contentType.sys.id}: ${error.message}`);
                }
            }
            console.log('Content type deletion completed');
        } catch (error) {
            console.log('Error during content type deletion:', error.message);
        }
    }

    async createContentType(contentTypeData) {
        try {
            console.log(`Creating content type: ${contentTypeData.name}`);
            
            const contentType = await this.environment.createContentTypeWithId(
                contentTypeData.id,
                {
                    name: contentTypeData.name,
                    fields: contentTypeData.fields.map(field => ({
                        id: field.id,
                        name: field.name,
                        type: field.type,
                        required: false,
                        localized: false
                    }))
                }
            );

            await contentType.publish();
            console.log(`Content type "${contentTypeData.name}" created and published`);
            
            await this.delay(500);
            return contentType;
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log(`Content type "${contentTypeData.name}" already exists, skipping...`);
                return null;
            }
            throw error;
        }
    }

    async createEntry(contentTypeId, entryData) {
        try {
            const fields = {};
            
            // Use 'en-US' instead of 'en' for locale code
            Object.keys(entryData).forEach(key => {
                fields[key] = { 'en-US': entryData[key] };
            });

            const entry = await this.environment.createEntry(contentTypeId, { fields });
            await entry.publish();
            
            await this.delay(200);
            return entry;
        } catch (error) {
            console.log(`Failed to create entry for ${contentTypeId}:`, error);
            throw error;
        }
    }

    async setupContentTypes() {
        console.log('Setting up content types...');
        
        for (const [key, contentType] of Object.entries(CONTENT_TYPES)) {
            await this.createContentType(contentType);
        }
        
        console.log('All content types created successfully');
    }

    async uploadContent() {
        console.log('Uploading content...');

        // First, get all assets to use their URLs
        await this.getAllAssets();

        // Hero section
        console.log('Creating hero section...');
        await this.createEntry('heroSection', SAMPLE_CONTENT.heroSection);

        // Focus areas
        console.log('Creating focus areas...');
        for (const focusArea of SAMPLE_CONTENT.focusAreas) {
            await this.createEntry('focusArea', focusArea);
        }

        // Climate risks
        console.log('Creating climate risks...');
        for (const risk of SAMPLE_CONTENT.climateRisks) {
            await this.createEntry('climateRisk', risk);
        }

        // Climate responses
        console.log('Creating climate responses...');
        for (const response of SAMPLE_CONTENT.climateResponses) {
            await this.createEntry('climateResponse', response);
        }

        // Partner logos
        console.log('Creating partner logos...');
        for (const partner of SAMPLE_CONTENT.partnerLogos) {
            await this.createEntry('partnerLogo', partner);
        }

        // Newsletter section
        console.log('Creating newsletter section...');
        await this.createEntry('newsletterSection', SAMPLE_CONTENT.newsletterSection);

        console.log('All content uploaded successfully');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async run() {
        try {
            await this.initialize();
            
            console.log('\nStep 1: Cleaning up existing content...');
            await this.deleteAllEntries();
            await this.deleteAllContentTypes();
            
            console.log('\nStep 2: Setting up fresh content types...');
            await this.setupContentTypes();
            
            console.log('\nStep 3: Uploading fresh content...');
            await this.uploadContent();
            
            console.log('\nSetup completed successfully!');
            console.log(`\nYou can now fetch content using:`);
            console.log(`Space ID: ${CONTENTFUL_CONFIG.spaceId}`);
            console.log(`Access Token: 5YmyLiRoDo7XRXolU5C-UVgMRnf9I5FF_6zaN3iAjFs`);
            
        } catch (error) {
            console.error('Setup failed:', error);
            process.exit(1);
        }
    }
}

// Run the script
const manager = new ContentfulManager();
manager.run();