const contentful = require('contentful-management');
const spaceId = 'zerelkd70urg';
const personalAccessToken = 'CFPAT-DTSYl7wEj1X0Vp1CZUrd3sDTS8hEFi_UprYYVEsmO6k';

async function updateFocusAreas() {
  try {
    console.log('Starting script to update focus areas...');

    // Initialize Contentful Management Client
    const client = contentful.createClient({
      accessToken: personalAccessToken
    });

    // Get the space
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');

    // Step 1: Update content type to add link field if it doesn't exist
    let contentType = await environment.getContentType('focusArea');
    const hasLinkField = contentType.fields.some(field => field.id === 'linkUrl');

    if (!hasLinkField) {
      contentType.fields.push({
        id: 'linkUrl',
        name: 'Link URL',
        type: 'Symbol',
        required: false,
        localized: false
      });

      await contentType.update();
      // Publish the updated content type
      contentType = await environment.getContentType('focusArea');
      await contentType.publish();
      console.log('Added linkUrl field to focusArea content type');
    } else {
      console.log('linkUrl field already exists in focusArea content type');
    }

    // Step 2: Fetch all focus area entries
    const entries = await environment.getEntries({
      content_type: 'focusArea'
    });

    // Step 3: Update each entry with the relative link
    for (const entry of entries.items) {
      entry.fields.linkUrl = {
        'en-US': '../Focus-Area/focus-area.html'
      };

      const updatedEntry = await entry.update();
      await updatedEntry.publish();
      console.log(`Updated entry: ${entry.fields.title['en-US']}`);
    }

    console.log('All focus area entries updated successfully');
  } catch (error) {
    console.error('Error updating focus areas:', error.message);
    if (error.response) {
      console.error('Response details:', error.response.data);
    }
  }
}

// Run the update function
updateFocusAreas();