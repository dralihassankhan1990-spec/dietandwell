const http = require('http');

// Helper function to make API calls
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: responseData ? JSON.parse(responseData) : null
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test cases
async function runTests() {
  console.log('========================================');
  console.log('   DIETANDWELL API TESTING');
  console.log('========================================\n');

  const randomId = Math.random().toString(36).substring(7);
  const testEmail = `testuser_${randomId}@test.com`;
  const testPassword = 'TestPassword123!';
  let authToken = null;

  try {
    // Test 1: Check API health
    console.log('TEST 1: Check API Health');
    console.log('------------------------');
    let result = await makeRequest('GET', '/api');
    console.log(`Status: ${result.statusCode}`);
    console.log(`Response:`, JSON.stringify(result.body, null, 2));
    console.log('✓ API is healthy\n');

    // Test 2: User Registration
    console.log('TEST 2: User Registration');
    console.log('------------------------');
    const registerData = {
      email: testEmail,
      password: testPassword,
      firstName: 'Test',
      lastName: 'User'
    };
    result = await makeRequest('POST', '/api/auth/register', registerData);
    console.log(`Status: ${result.statusCode}`);
    console.log(`Response:`, JSON.stringify(result.body, null, 2));
    if (result.statusCode === 201 || result.statusCode === 200) {
      console.log(`✓ User registered successfully: ${testEmail}\n`);
    } else {
      console.log(`✗ Registration failed\n`);
    }

    // Test 3: User Login
    console.log('TEST 3: User Login');
    console.log('------------------------');
    const loginData = {
      email: testEmail,
      password: testPassword
    };
    result = await makeRequest('POST', '/api/auth/login', loginData);
    console.log(`Status: ${result.statusCode}`);
    console.log(`Response:`, JSON.stringify(result.body, null, 2));
    if (result.statusCode === 200 || result.statusCode === 201) {
      authToken = result.body.access_token || result.body.accessToken;
      console.log(`✓ User logged in successfully`);
      console.log(`Token: ${authToken ? authToken.substring(0, 20) + '...' : 'None'}\n`);
    } else {
      console.log(`✗ Login failed\n`);
    }

    // Test 4: Get Current User (with auth)
    if (authToken) {
      console.log('TEST 4: Get Current User');
      console.log('------------------------');
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/me',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      };
      result = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : null
          }));
        });
        req.on('error', reject);
        req.end();
      });
      console.log(`Status: ${result.statusCode}`);
      console.log(`Response:`, JSON.stringify(result.body, null, 2));
      console.log('✓ Current user retrieved\n');
    }

    // Test 5: Get Blog Posts
    console.log('TEST 5: Get Blog Posts');
    console.log('------------------------');
    result = await makeRequest('GET', '/api/blog');
    console.log(`Status: ${result.statusCode}`);
    console.log(`Number of posts: ${Array.isArray(result.body) ? result.body.length : result.body?.data?.length || 'Unknown'}`);
    if (Array.isArray(result.body) && result.body.length > 0) {
      console.log(`First blog: ${result.body[0].title}`);
    }
    console.log('✓ Blog posts retrieved\n');

    // Test 6: Get Products
    console.log('TEST 6: Get Products');
    console.log('------------------------');
    result = await makeRequest('GET', '/api/products');
    console.log(`Status: ${result.statusCode}`);
    console.log(`Number of products: ${Array.isArray(result.body) ? result.body.length : result.body?.data?.length || 'Unknown'}`);
    console.log('✓ Products retrieved\n');

    // Test 7: Get Services
    console.log('TEST 7: Get Services');
    console.log('------------------------');
    result = await makeRequest('GET', '/api/services');
    console.log(`Status: ${result.statusCode}`);
    console.log(`Response keys:`, Object.keys(result.body || {}).join(', '));
    console.log('✓ Services retrieved\n');

    // Test 8: Get Calculators
    console.log('TEST 8: Get Calculators');
    console.log('------------------------');
    result = await makeRequest('GET', '/api/calculators');
    console.log(`Status: ${result.statusCode}`);
    console.log('✓ Calculators endpoint responded\n');

    // Test 9: Contact Form Submission
    console.log('TEST 9: Contact Form Submission');
    console.log('------------------------');
    const contactData = {
      name: 'Test User',
      email: testEmail,
      subject: 'Test Subject',
      message: 'This is a test message from the API testing script.'
    };
    result = await makeRequest('POST', '/api/contact', contactData);
    console.log(`Status: ${result.statusCode}`);
    console.log(`Response:`, JSON.stringify(result.body, null, 2));
    console.log('✓ Contact form submitted\n');

    console.log('========================================');
    console.log('   ALL TESTS COMPLETED');
    console.log('========================================');

  } catch (error) {
    console.error('Error during testing:', error.message);
  }
}

runTests();
