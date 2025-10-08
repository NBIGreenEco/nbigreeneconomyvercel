const contentful = require('contentful-management');

const spaceId = 'zerelkd70urg';
const personalAccessToken = 'CFPAT-DTSYl7wEj1X0Vp1CZUrd3sDTS8hEFi_UprYYVEsmO6k';

async function updateClimateRisks() {
  try {
    console.log('Starting script to update climate risks at', new Date().toLocaleString('en-ZA'));

    // Initialize Contentful Management Client
    const client = contentful.createClient({
      accessToken: personalAccessToken
    });

    // Get the space and master environment
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');

    // Step 1: Update content type to add iconImage field if it doesn't exist
    let contentType = await environment.getContentType('climateRisk');
    const hasIconImageField = contentType.fields.some(field => field.id === 'iconImage');

    if (!hasIconImageField) {
      contentType.fields.push({
        id: 'iconImage',
        name: 'Icon Image',
        type: 'Link',
        linkType: 'Asset',
        required: false,
        localized: false
      });

      await contentType.update();
      contentType = await environment.getContentType('climateRisk');
      await contentType.publish();
      console.log('Added iconImage field to climateRisk content type');
    } else {
      console.log('iconImage field already exists in climateRisk content type');
    }

    // Step 2: Define mapping of risk titles to asset IDs
    const riskToAssetMap = {
      'Risk of physical damage to structures': '1RnW1nTnR3w7RLvPq4ftcr',
      'Risk of increased operating costs': '4WxESDfZ0jVFKzyK6OjB4K',
      'Risk of supply chain disruptions': '1KXQFQo7FfcEQbXaQzlTE4', // Updated with correct ID
      'Regulatory risk': '3NE1YxJo9bKin4CiMC0LUP',
      'Reputational risk': '5a4OcDd7MYBVpKsnS3NOCH'
    };

    // Step 3: Fetch all climate risk entries
    const entries = await environment.getEntries({
      content_type: 'climateRisk'
    });

    // Step 4: Update each entry with the corresponding image asset
    for (const entry of entries.items) {
      const title = entry.fields.title['en-US'];
      const assetId = riskToAssetMap[title];

      if (assetId) {
        // Verify asset exists before linking
        try {
          const asset = await environment.getAsset(assetId);
          if (!asset || !asset.fields || !asset.fields.file) {
            console.error(`Asset ID ${assetId} for ${title} is invalid or lacks file data`);
            continue;
          }
          console.log(`Verified asset ${assetId} for ${title} exists and is published:`, asset.sys.publishedVersion);
        } catch (assetError) {
          console.error(`Failed to verify asset ${assetId} for ${title}:`, assetError.message);
          continue;
        }

        entry.fields.iconImage = {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: assetId
            }
          }
        };

        const updatedEntry = await entry.update();
        await updatedEntry.publish();
        console.log(`Updated entry: ${title} with asset ID ${assetId}. New iconImage:`, JSON.stringify(updatedEntry.fields.iconImage));
      } else {
        console.warn(`No valid asset ID for ${title}. Check riskToAssetMap.`);
      }
    }

    console.log('All climate risk entries updated successfully at', new Date().toLocaleString('en-ZA'));
  } catch (error) {
    console.error('Error updating climate risks:', error.message);
    if (error.response) {
      console.error('Response details:', error.response.data);
    }
  }
}

// Run the update function
updateClimateRisks();