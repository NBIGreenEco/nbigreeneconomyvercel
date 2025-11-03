
require('dotenv').config();
const contentful = require('contentful-management');

const spaceId = process.env.CONTENTFUL_SPACE_ID || 'zerelkd70urg';
const personalAccessToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

// Define proper links for each focus area
const focusAreaLinks = {
  'agriculture': '../energy.html',
  'energy': '../energy.html', 
  'natural-resource': '../natural.html',
  'transport': '../transport.html',
  'environmental': '../environment.html',
  'buildings': '../building.html',
  'waste': '../waste.html',
  'water': '../water.html',
  'production': '../production.html'
};

async function updateFocusAreas() {
  try {
    console.log('Starting script to update focus areas...');

    if (!personalAccessToken) {
      throw new Error('No CONTENTFUL_MANAGEMENT_TOKEN found in environment variables');
    }

    // Initialize Contentful Management Client
    const client = contentful.createClient({
      accessToken: personalAccessToken
    });

    // Get the space
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');

    console.log('✅ Connected to space and environment');

    // Step 1: Check if linkUrl field exists, add if not
    let contentType;
    try {
      contentType = await environment.getContentType('focusArea');
      console.log('✅ Found focusArea content type');
      
      const hasLinkField = contentType.fields.some(field => field.id === 'linkUrl');
      
      if (!hasLinkField) {
        console.log('Adding linkUrl field to focusArea content type...');
        contentType.fields.push({
          id: 'linkUrl',
          name: 'Link URL',
          type: 'Symbol',
          required: false,
          localized: false
        });

        await contentType.update();
        contentType = await environment.getContentType('focusArea');
        await contentType.publish();
        console.log('✅ Added linkUrl field to focusArea content type');
      } else {
        console.log('✅ linkUrl field already exists in focusArea content type');
      }
    } catch (error) {
      console.error('Error with content type:', error.message);
      throw error;
    }

    // Step 2: Fetch all focus area entries
    console.log('Fetching focus area entries...');
    const entries = await environment.getEntries({
      content_type: 'focusArea'
    });

    console.log(`Found ${entries.items.length} focus area entries`);

    // Step 3: Update each entry with the correct link
    for (const entry of entries.items) {
      const title = entry.fields.title?.['en-US']?.toLowerCase() || '';
      const slug = entry.fields.slug?.['en-US'] || '';
      
      console.log(`Processing: ${entry.fields.title?.['en-US']}`);
      
      // Determine the appropriate link
      let linkUrl = '../energy.html'; // default fallback
      
      // Match by slug first, then by title keywords
      if (slug && focusAreaLinks[slug]) {
        linkUrl = focusAreaLinks[slug];
      } else if (title.includes('agriculture')) {
        linkUrl = focusAreaLinks.agriculture;
      } else if (title.includes('energy')) {
        linkUrl = focusAreaLinks.energy;
      } else if (title.includes('natural resource') || title.includes('mining')) {
        linkUrl = focusAreaLinks['natural-resource'];
      } else if (title.includes('transport')) {
        linkUrl = focusAreaLinks.transport;
      } else if (title.includes('environmental') || title.includes('tourism')) {
        linkUrl = focusAreaLinks.environmental;
      } else if (title.includes('building')) {
        linkUrl = focusAreaLinks.buildings;
      } else if (title.includes('waste') || title.includes('recycling')) {
        linkUrl = focusAreaLinks.waste;
      } else if (title.includes('water')) {
        linkUrl = focusAreaLinks.water;
      } else if (title.includes('production') || title.includes('consumption')) {
        linkUrl = focusAreaLinks.production;
      }

      // Update the entry with the correct link
      if (!entry.fields.linkUrl) {
        entry.fields.linkUrl = {};
      }
      entry.fields.linkUrl['en-US'] = linkUrl;

      try {
        const updatedEntry = await entry.update();
        await updatedEntry.publish();
        console.log(`✅ Updated: ${entry.fields.title['en-US']} → ${linkUrl}`);
      } catch (updateError) {
        console.error(`❌ Failed to update ${entry.fields.title['en-US']}:`, updateError.message);
      }
    }

    console.log('All focus area entries processed successfully');
  } catch (error) {
    console.error('Error updating focus areas:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the update function
updateFocusAreas();