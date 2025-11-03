require('dotenv').config();
const contentful = require('contentful-management');

const spaceId = process.env.CONTENTFUL_SPACE_ID || 'zerelkd70urg';
const personalAccessToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

console.log('Token being used:', personalAccessToken ? '***' + personalAccessToken.slice(-8) : 'NOT FOUND');

async function testToken() {
  try {
    if (!personalAccessToken) {
      console.error('❌ No token found in environment variables');
      return false;
    }

    console.log('Testing token...');
    
    const client = contentful.createClient({
      accessToken: personalAccessToken
    });

    const space = await client.getSpace(spaceId);
    console.log('✅ Successfully connected to space:', space.name);
    
    return true;
  } catch (error) {
    console.error('❌ Token test failed:', error.message);
    return false;
  }
}

testToken();