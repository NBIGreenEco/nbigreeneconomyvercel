#!/usr/bin/env node

require("dotenv").config();
const fs = require('fs');
const path = require('path');

// Contentful configuration
const CONTENTFUL_CONFIG = {
    spaceId: 'zerelkd70urg',
    accessToken: 'CFPAT-DTSYl7wEj1X0Vp1CZUrd3sDTS8hEFi_UprYYVEsmO6k',
    environment: 'master'
};

class ContentfulExporter {
    constructor() {
        this.contentful = require('contentful-management');
        this.client = null;
        this.space = null;
        this.environment = null;
        this.exportData = {
            timestamp: new Date().toISOString(),
            spaceId: CONTENTFUL_CONFIG.spaceId,
            environment: CONTENTFUL_CONFIG.environment,
            contentTypes: {},
            entries: {},
            assets: []
        };
    }

    async initialize() {
        console.log('Initializing Contentful client...');
        this.client = this.contentful.createClient({
            accessToken: CONTENTFUL_CONFIG.accessToken
        });

        this.space = await this.client.getSpace(CONTENTFUL_CONFIG.spaceId);
        this.environment = await this.space.getEnvironment(CONTENTFUL_CONFIG.environment);
        console.log('Contentful client initialized successfully');
    }

    async getAllContentTypes() {
        console.log('Fetching all content types...');
        try {
            const contentTypes = await this.environment.getContentTypes();
            console.log(`Found ${contentTypes.items.length} content types`);
            
            this.exportData.contentTypes = contentTypes.items.reduce((acc, contentType) => {
                acc[contentType.sys.id] = {
                    name: contentType.name,
                    fields: contentType.fields.map(field => ({
                        id: field.id,
                        name: field.name,
                        type: field.type,
                        required: field.required,
                        localized: field.localized
                    }))
                };
                return acc;
            }, {});
            
            return this.exportData.contentTypes;
        } catch (error) {
            console.error('Error fetching content types:', error.message);
            return {};
        }
    }

    async getAllEntries() {
        console.log('Fetching all entries...');
        try {
            let entries = [];
            let skip = 0;
            const limit = 100;
            let hasMore = true;

            while (hasMore) {
                const response = await this.environment.getEntries({
                    skip,
                    limit,
                    include: 2 // Include linked entries
                });

                entries = entries.concat(response.items);
                skip += limit;
                hasMore = skip < response.total;
                console.log(`Fetched ${entries.length} of ${response.total} entries`);
            }

            console.log(`Total entries found: ${entries.length}`);

            // Organize entries by content type
            this.exportData.entries = entries.reduce((acc, entry) => {
                const contentType = entry.sys.contentType.sys.id;
                if (!acc[contentType]) {
                    acc[contentType] = [];
                }

                // Extract clean entry data
                const entryData = {
                    id: entry.sys.id,
                    createdAt: entry.sys.createdAt,
                    updatedAt: entry.sys.updatedAt,
                    fields: {}
                };

                // Process fields
                if (entry.fields) {
                    Object.keys(entry.fields).forEach(fieldName => {
                        const fieldValue = entry.fields[fieldName];
                        if (fieldValue && fieldValue['en-US'] !== undefined) {
                            entryData.fields[fieldName] = fieldValue['en-US'];
                        } else {
                            entryData.fields[fieldName] = fieldValue;
                        }
                    });
                }

                acc[contentType].push(entryData);
                return acc;
            }, {});

            return this.exportData.entries;
        } catch (error) {
            console.error('Error fetching entries:', error.message);
            return {};
        }
    }

    async getAllAssets() {
        console.log('Fetching all assets...');
        try {
            let assets = [];
            let skip = 0;
            const limit = 100;
            let hasMore = true;

            while (hasMore) {
                const response = await this.environment.getAssets({
                    skip,
                    limit
                });

                assets = assets.concat(response.items);
                skip += limit;
                hasMore = skip < response.total;
                console.log(`Fetched ${assets.length} of ${response.total} assets`);
            }

            console.log(`Total assets found: ${assets.length}`);

            this.exportData.assets = assets.map(asset => {
                const assetData = {
                    id: asset.sys.id,
                    createdAt: asset.sys.createdAt,
                    updatedAt: asset.sys.updatedAt,
                    title: asset.fields.title ? asset.fields.title['en-US'] : null,
                    description: asset.fields.description ? asset.fields.description['en-US'] : null,
                    fileName: asset.fields.file ? asset.fields.file['en-US'].fileName : null,
                    url: asset.fields.file ? `https:${asset.fields.file['en-US'].url}` : null,
                    contentType: asset.fields.file ? asset.fields.file['en-US'].contentType : null,
                    details: asset.fields.file ? asset.fields.file['en-US'].details : null
                };
                return assetData;
            });

            return this.exportData.assets;
        } catch (error) {
            console.error('Error fetching assets:', error.message);
            return [];
        }
    }

    async generateSummary() {
        console.log('\n=== CONTENTFUL EXPORT SUMMARY ===');
        console.log(`Space ID: ${this.exportData.spaceId}`);
        console.log(`Environment: ${this.exportData.environment}`);
        console.log(`Timestamp: ${this.exportData.timestamp}`);
        console.log(`Content Types: ${Object.keys(this.exportData.contentTypes).length}`);
        
        let totalEntries = 0;
        Object.keys(this.exportData.entries).forEach(contentType => {
            const count = this.exportData.entries[contentType].length;
            console.log(`  - ${contentType}: ${count} entries`);
            totalEntries += count;
        });
        
        console.log(`Total Entries: ${totalEntries}`);
        console.log(`Assets: ${this.exportData.assets.length}`);
        console.log('==================================\n');
    }

    async saveExport() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `contentful-export-${timestamp}.json`;
        const filepath = path.join(__dirname, filename);

        try {
            fs.writeFileSync(filepath, JSON.stringify(this.exportData, null, 2));
            console.log(`Export saved to: ${filepath}`);
            return filepath;
        } catch (error) {
            console.error('Error saving export:', error.message);
            return null;
        }
    }

    async exportAllContent() {
        try {
            await this.initialize();
            
            console.log('Starting Contentful export...\n');
            
            await this.getAllContentTypes();
            await this.getAllEntries();
            await this.getAllAssets();
            
            await this.generateSummary();
            
            const exportPath = await this.saveExport();
            
            if (exportPath) {
                console.log('✅ Export completed successfully!');
                console.log(`📁 File: ${exportPath}`);
            } else {
                console.log('❌ Export completed with errors');
            }
            
            return this.exportData;
            
        } catch (error) {
            console.error('Export failed:', error);
            process.exit(1);
        }
    }
}

// Run the export if this script is executed directly
if (require.main === module) {
    const exporter = new ContentfulExporter();
    exporter.exportAllContent();
}

module.exports = ContentfulExporter;