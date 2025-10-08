#!/usr/bin/env node

require("dotenv").config();
const contentful = require("contentful-management");

// Contentful configuration
const CONTENTFUL_CONFIG = {
    spaceId: 'zerelkd70urg',
    accessToken: 'CFPAT-DTSYl7wEj1X0Vp1CZUrd3sDTS8hEFi_UprYYVEsmO6k',
    environment: 'master'
};

// Content type definitions for Knowledge Hub
const CONTENT_TYPES = {
    knowledgeHubHero: {
        id: 'knowledgeHubHero',
        name: 'Knowledge Hub Hero',
        fields: [
            { id: 'title', name: 'Title', type: 'Symbol' },
            { id: 'imageUrl', name: 'Image URL', type: 'Symbol' },
            { id: 'imageAlt', name: 'Image Alt Text', type: 'Symbol' }
        ]
    },
    knowledgeHubSection: {
        id: 'knowledgeHubSection',
        name: 'Knowledge Hub Section',
        fields: [
            { id: 'title', name: 'Title', type: 'Symbol' },
            { id: 'description', name: 'Description', type: 'Text' },
            { id: 'backgroundColor', name: 'Background Color', type: 'Symbol' },
            { id: 'buttonText', name: 'Button Text', type: 'Symbol' },
            { id: 'buttonLink', name: 'Button Link', type: 'Symbol' },
            { id: 'buttonIcon', name: 'Button Icon', type: 'Symbol' },
            { id: 'sectionType', name: 'Section Type', type: 'Symbol' }, // learning, business, market
            { id: 'order', name: 'Display Order', type: 'Integer' }
        ]
    },
    knowledgeHubPartner: {
        id: 'knowledgeHubPartner',
        name: 'Knowledge Hub Partner',
        fields: [
            { id: 'name', name: 'Partner Name', type: 'Symbol' },
            { id: 'logoUrl', name: 'Logo URL', type: 'Symbol' },
            { id: 'altText', name: 'Alt Text', type: 'Symbol' },
            { id: 'order', name: 'Display Order', type: 'Integer' }
        ]
    },
    knowledgeHubNewsletter: {
        id: 'knowledgeHubNewsletter',
        name: 'Knowledge Hub Newsletter',
        fields: [
            { id: 'title', name: 'Title', type: 'Symbol' },
            { id: 'emailPlaceholder', name: 'Email Placeholder', type: 'Symbol' },
            { id: 'submitTitle', name: 'Submit Button Title', type: 'Symbol' },
            { id: 'note', name: 'Note Text', type: 'Symbol' }
        ]
    }
};

// Sample content data for Knowledge Hub
const SAMPLE_CONTENT = {
    knowledgeHubHero: {
        title: 'WELCOME TO OUR KNOWLEDGE HUB',
        imageUrl: 'https://www.greeneconomytoolkit.com/imager/files/15784/AdobeStock_432374794_44085a960aeecfce3e46bcb76e3e6d3e.webp',
        imageAlt: 'Knowledge Hub Hero Image'
    },
    knowledgeHubSections: [
        {
            title: 'Access to learning opportunities',
            description: 'The National Business Initiative (NBI) has created an online application to improve the learning experience for technical and business-related topics.\n\nKey features of the app include offline access to content; the ability to download and complete content activities with outcomes logged on the learning management system when connected; interactive engagement; self-paced self-learning; the option to register and manage your profile; and tracking of learning progress.\n\nThis app is part of the Installation, Repair and Maintenance (IRM) Initiative, which aims to unlock demand for jobs and create opportunities for youth to access those jobs. The Initiative is a collaboration between the NBI, the government and the private sector, offering demand-led skills training, workplace-based learning, and enterprise development with technology integration for a more dynamic learning process.',
            backgroundColor: '#2b9589',
            buttonText: 'App Store',
            buttonLink: '#',
            buttonIcon: 'https://th.bing.com/th/id/OIP.KzOFPzLnbMPTb4zlzxi8PgHaHa?w=170&h=180&c=7&r=0&o=7&dpr=1.4&pid=1.7&rm=3',
            sectionType: 'learning',
            order: 1
        },
        {
            title: 'Access to business development support',
            description: 'The IRM Initiative hub is a platform that provides access to various opportunities including procurement, access to market, capacity building, training and enterprise development support.\n\nTo gain access to the various opportunities, click the link below, register and complete the application form, which will give you access to various opportunities under the "Opportunities" tab on the hub.',
            backgroundColor: '#ffffff',
            buttonText: 'Register',
            buttonLink: '#',
            buttonIcon: '',
            sectionType: 'business',
            order: 2
        },
        {
            title: 'Access to market opportunities',
            description: 'Our business development support services are designed to help you thrive in today\'s competitive market. Through our hubs, we assist township-based SMMEs in identifying opportunities, and equipping them with the skills and tools to ensure that they adapt to market trends. We also help them create networks and partnerships.',
            backgroundColor: '#2b9589',
            buttonText: 'Register',
            buttonLink: '#',
            buttonIcon: '',
            sectionType: 'market',
            order: 3
        }
    ],
    knowledgeHubPartners: [
        { name: 'GIZ', logoUrl: '/Images/giz-logo_2024-11-11-133203_nara.jpg', altText: 'GIZ Partner Logo', order: 1 },
        { name: 'SECO', logoUrl: '/Images/SECO-Logo.jpg', altText: 'SECO Partner Logo', order: 2 },
        { name: 'GDED', logoUrl: '/Images/GDED-Logo.jpg', altText: 'GDED Partner Logo', order: 3 },
        { name: 'LMS Platform', logoUrl: '/Images/LMS-Platform-Logo.png', altText: 'LMS Platform Logo', order: 4 },
        { name: 'NBI', logoUrl: '/Images/NBI-Logo.jpg', altText: 'NBI Partner Logo', order: 5 },
        { name: 'New Partner', logoUrl: '/Images/new-partner-logo.png', altText: 'New Partner Logo', order: 6 }
    ],
    knowledgeHubNewsletter: {
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

    async deleteAllEntries(contentTypeIds = []) {
        console.log('Deleting existing knowledge hub entries...');
        
        try {
            const entries = await this.environment.getEntries({ 
                limit: 1000,
                'sys.contentType.sys.id[in]': contentTypeIds.join(',')
            });
            
            console.log(`Found ${entries.items.length} entries to delete`);

            for (const entry of entries.items) {
                try {
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
            
            // Use 'en-US' for locale code
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
        console.log('Setting up knowledge hub content types...');
        
        for (const [key, contentType] of Object.entries(CONTENT_TYPES)) {
            await this.createContentType(contentType);
        }
        
        console.log('All knowledge hub content types created successfully');
    }

    async uploadContent() {
        console.log('Uploading knowledge hub content...');

        // Hero section
        console.log('Creating knowledge hub hero...');
        await this.createEntry('knowledgeHubHero', SAMPLE_CONTENT.knowledgeHubHero);

        // Sections
        console.log('Creating knowledge hub sections...');
        for (const section of SAMPLE_CONTENT.knowledgeHubSections) {
            await this.createEntry('knowledgeHubSection', section);
        }

        // Partners
        console.log('Creating knowledge hub partners...');
        for (const partner of SAMPLE_CONTENT.knowledgeHubPartners) {
            await this.createEntry('knowledgeHubPartner', partner);
        }

        // Newsletter
        console.log('Creating knowledge hub newsletter...');
        await this.createEntry('knowledgeHubNewsletter', SAMPLE_CONTENT.knowledgeHubNewsletter);

        console.log('All knowledge hub content uploaded successfully');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async run() {
        try {
            await this.initialize();
            
            const contentTypeIds = Object.keys(CONTENT_TYPES).map(key => CONTENT_TYPES[key].id);
            
            console.log('\nStep 1: Cleaning up existing knowledge hub content...');
            await this.deleteAllEntries(contentTypeIds);
            
            console.log('\nStep 2: Setting up knowledge hub content types...');
            await this.setupContentTypes();
            
            console.log('\nStep 3: Uploading knowledge hub content...');
            await this.uploadContent();
            
            console.log('\nKnowledge Hub setup completed successfully!');
            console.log(`\nYou can now fetch content using:`);
            console.log(`Space ID: ${CONTENTFUL_CONFIG.spaceId}`);
            console.log(`Access Token: 5YmyLiRoDo7XRXolU5C-UVgMRnf9I5FF_6zaN3iAjFs`);
            
        } catch (error) {
            console.error('Knowledge Hub setup failed:', error);
            process.exit(1);
        }
    }
}

// Run the script
const manager = new ContentfulManager();
manager.run();