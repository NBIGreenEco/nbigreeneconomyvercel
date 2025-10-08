#!/usr/bin/env node

require("dotenv").config();
const contentful = require("contentful-management");

// Contentful configuration
const CONTENTFUL_CONFIG = {
    spaceId: 'zerelkd70urg',
    accessToken: 'CFPAT-DTSYl7wEj1X0Vp1CZUrd3sDTS8hEFi_UprYYVEsmO6k',
    environment: 'master'
};

// Content type definitions for Opportunities
const CONTENT_TYPES = {
    opportunitiesHero: {
        id: 'opportunitiesHero',
        name: 'Opportunities Hero',
        fields: [
            { id: 'title', name: 'Title', type: 'Symbol' },
            { id: 'description1', name: 'Description 1', type: 'Text' },
            { id: 'description2', name: 'Description 2', type: 'Text' },
            { id: 'imageUrl', name: 'Image URL', type: 'Symbol' },
            { id: 'imageAlt', name: 'Image Alt Text', type: 'Symbol' }
        ]
    },
    opportunityCard: {
        id: 'opportunityCard',
        name: 'Opportunity Card',
        fields: [
            { id: 'title', name: 'Title', type: 'Symbol' },
            { id: 'description', name: 'Description', type: 'Text' },
            { id: 'link', name: 'Link', type: 'Symbol' },
            { id: 'linkText', name: 'Link Text', type: 'Symbol' },
            { id: 'category', name: 'Category', type: 'Symbol' }, // procurement, market-access, capacity-building, training, enterprise-development
            { id: 'order', name: 'Display Order', type: 'Integer' }
        ]
    },
    opportunitiesPartner: {
        id: 'opportunitiesPartner',
        name: 'Opportunities Partner',
        fields: [
            { id: 'name', name: 'Partner Name', type: 'Symbol' },
            { id: 'logoUrl', name: 'Logo URL', type: 'Symbol' },
            { id: 'altText', name: 'Alt Text', type: 'Symbol' },
            { id: 'order', name: 'Display Order', type: 'Integer' }
        ]
    },
    opportunitiesNewsletter: {
        id: 'opportunitiesNewsletter',
        name: 'Opportunities Newsletter',
        fields: [
            { id: 'title', name: 'Title', type: 'Symbol' },
            { id: 'emailPlaceholder', name: 'Email Placeholder', type: 'Symbol' },
            { id: 'submitTitle', name: 'Submit Button Title', type: 'Symbol' },
            { id: 'note', name: 'Note Text', type: 'Symbol' }
        ]
    }
};

// Sample content data for Opportunities
const SAMPLE_CONTENT = {
    opportunitiesHero: {
        title: 'Opportunities',
        description1: 'Find out about opportunities for procurement, market access, capacity building, training and enterprise development support in your area.',
        description2: 'This page is your go-to hub for all the information you need, right at your fingertips. Use the filter to select resources tailored to your specific category of interest.',
        imageUrl: 'https://images.pexels.com/photos/30733226/pexels-photo-30733226.jpeg',
        imageAlt: 'Opportunities Hero Image'
    },
    opportunityCards: [
        {
            title: "Green Finance Database",
            description: "The database contains information on funding opportunities, the types of funding and institutions providing the funding and contact details. It is ideal for any entity seeking a broad range of funding...",
            link: "#",
            linkText: "Click here to download",
            category: "procurement",
            order: 1
        },
        {
            title: "Call for Host Companies",
            description: "The NBI's Installation, Repair and Maintenance initiative in partnership with the Youth Employment Service invites SME'S who are interested and equipped to host unemployed graduates with green technic...",
            link: "#",
            linkText: "View Details",
            category: "market-access",
            order: 2
        },
        {
            title: "Green Careers",
            description: "As South Africa transitions to a more inclusive green economy, making a green career choice can bring benefits for our country and ensure that a healthy environment supports our collective well-being.",
            link: "#",
            linkText: "View Details",
            category: "capacity-building",
            order: 3
        },
        {
            title: "Green Finance Platform",
            description: "The Green Finance Platform (GFP) is a global network of organizations and experts that address major knowledge gaps in sustainable finance.",
            link: "#",
            linkText: "View details",
            category: "training",
            order: 4
        },
        {
            title: "Green Policy Platform",
            description: "The GGKP is a global community of organisations and experts committed to collaboratively generating, managing and sharing green growth knowledge and data to mobilise a sustainable future.",
            link: "#",
            linkText: "View details",
            category: "enterprise-development",
            order: 5
        },
        {
            title: "Green Industry Platform",
            description: "The Green Industry Platform (GIP) provides sector-and country-specific technical and practical knowledge to support a green industrial transformation.",
            link: "#",
            linkText: "View details",
            category: "procurement",
            order: 6
        },
        {
            title: "Calling Artisan SMMEs and Employers to host young people for Workspace Learning",
            description: "Calling on Artisan SMMEs and Employers: Host young people for Workplace learning with benefits including work-ready candidates, covered trainee stipends, and more.",
            link: "#",
            linkText: "View details",
            category: "market-access",
            order: 7
        },
        {
            title: "Department of Forestry, Fisheries and the Environment",
            description: "A South African government department responsible for protecting, conserving and improving the South African environment and natural resources.",
            link: "#",
            linkText: "View details",
            category: "capacity-building",
            order: 8
        },
        {
            title: "Centre for Scientific and Industrial Research",
            description: "A statutory research body that looks at how to make life in South Africa better. The CSIR has created a guide for South Africa's green economy",
            link: "#",
            linkText: "View details",
            category: "training",
            order: 9
        },
        {
            title: "Trade & Industrial Policy Strategies",
            description: "An independent research organisation that focuses on industrial policy, sustainability and inclusive growth",
            link: "#",
            linkText: "View details",
            category: "enterprise-development",
            order: 10
        },
        {
            title: "National Cleaner Production Centre",
            description: "A national support programme that drives the transition of South African industry towards a green economy through appropriate resource efficiency and cleaner production interventions",
            link: "#",
            linkText: "View details",
            category: "procurement",
            order: 11
        },
        {
            title: "Sector education and training authorities",
            description: "Sector education and training authorities (seta) – your relevant seta can tell you about funding opportunities, especially for skills training",
            link: "#",
            linkText: "View details",
            category: "market-access",
            order: 12
        }
    ],
    opportunitiesPartners: [
        { name: 'GIZ', logoUrl: '/Images/giz-logo_2024-11-11-133203_nara.jpg', altText: 'GIZ Partner Logo', order: 1 },
        { name: 'SECO', logoUrl: '/Images/SECO-Logo.jpg', altText: 'SECO Partner Logo', order: 2 },
        { name: 'GDED', logoUrl: '/Images/GDED-Logo.jpg', altText: 'GDED Partner Logo', order: 3 },
        { name: 'LMS Platform', logoUrl: '/Images/LMS-Platform-Logo.png', altText: 'LMS Platform Logo', order: 4 },
        { name: 'NBI', logoUrl: '/Images/NBI-Logo.jpg', altText: 'NBI Partner Logo', order: 5 },
        { name: 'New Partner', logoUrl: '/Images/new-partner-logo.png', altText: 'New Partner Logo', order: 6 }
    ],
    opportunitiesNewsletter: {
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
        console.log('Deleting existing opportunities entries...');
        
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
        console.log('Setting up opportunities content types...');
        
        for (const [key, contentType] of Object.entries(CONTENT_TYPES)) {
            await this.createContentType(contentType);
        }
        
        console.log('All opportunities content types created successfully');
    }

    async uploadContent() {
        console.log('Uploading opportunities content...');

        // Hero section
        console.log('Creating opportunities hero...');
        await this.createEntry('opportunitiesHero', SAMPLE_CONTENT.opportunitiesHero);

        // Opportunity cards
        console.log('Creating opportunity cards...');
        for (const card of SAMPLE_CONTENT.opportunityCards) {
            await this.createEntry('opportunityCard', card);
        }

        // Partners
        console.log('Creating opportunities partners...');
        for (const partner of SAMPLE_CONTENT.opportunitiesPartners) {
            await this.createEntry('opportunitiesPartner', partner);
        }

        // Newsletter
        console.log('Creating opportunities newsletter...');
        await this.createEntry('opportunitiesNewsletter', SAMPLE_CONTENT.opportunitiesNewsletter);

        console.log('All opportunities content uploaded successfully');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async run() {
        try {
            await this.initialize();
            
            const contentTypeIds = Object.keys(CONTENT_TYPES).map(key => CONTENT_TYPES[key].id);
            
            console.log('\nStep 1: Cleaning up existing opportunities content...');
            await this.deleteAllEntries(contentTypeIds);
            
            console.log('\nStep 2: Setting up opportunities content types...');
            await this.setupContentTypes();
            
            console.log('\nStep 3: Uploading opportunities content...');
            await this.uploadContent();
            
            console.log('\nOpportunities setup completed successfully!');
            console.log(`\nYou can now fetch content using:`);
            console.log(`Space ID: ${CONTENTFUL_CONFIG.spaceId}`);
            console.log(`Access Token: 5YmyLiRoDo7XRXolU5C-UVgMRnf9I5FF_6zaN3iAjFs`);
            
        } catch (error) {
            console.error('Opportunities setup failed:', error);
            process.exit(1);
        }
    }
}

// Run the script
const manager = new ContentfulManager();
manager.run();