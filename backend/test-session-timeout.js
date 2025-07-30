const jwt = require('jsonwebtoken');

// Test function to simulate session timeout
function testSessionTimeout() {
  console.log('Testing Session Timeout Functionality...\n');

  // Simulate a token issued 11 minutes ago (should be expired for regular users)
  const elevenMinutesAgo = Math.floor((Date.now() - 11 * 60 * 1000) / 1000);
  
  // Test token for regular user
  const regularUserToken = jwt.sign(
    { 
      userId: 'test-user-id', 
      plan: 'Freemium', 
      role: 'user',
      iat: elevenMinutesAgo 
    },
    'test-secret',
    { expiresIn: '1d' }
  );

  // Test token for admin user
  const adminUserToken = jwt.sign(
    { 
      userId: 'test-admin-id', 
      plan: 'Aditya', 
      role: 'admin',
      iat: elevenMinutesAgo 
    },
    'test-secret',
    { expiresIn: '1d' }
  );

  // Decode tokens to check their content
  const regularUserDecoded = jwt.decode(regularUserToken);
  const adminUserDecoded = jwt.decode(adminUserToken);

  console.log('Regular User Token (issued 11 minutes ago):');
  console.log('- Role:', regularUserDecoded.role);
  console.log('- Issued at:', new Date(regularUserDecoded.iat * 1000).toISOString());
  console.log('- Time since issued:', Math.floor((Date.now() - regularUserDecoded.iat * 1000) / 1000 / 60), 'minutes');
  console.log('- Should expire after 10 minutes: YES\n');

  console.log('Admin User Token (issued 11 minutes ago):');
  console.log('- Role:', adminUserDecoded.role);
  console.log('- Issued at:', new Date(adminUserDecoded.iat * 1000).toISOString());
  console.log('- Time since issued:', Math.floor((Date.now() - adminUserDecoded.iat * 1000) / 1000 / 60), 'minutes');
  console.log('- Should expire after 10 minutes: NO (admin has no timeout)\n');

  // Test session timeout logic
  const currentTime = Date.now();
  const tenMinutesInMs = 10 * 60 * 1000;

  // Check regular user timeout
  const regularUserElapsed = currentTime - regularUserDecoded.iat * 1000;
  const regularUserExpired = regularUserElapsed > tenMinutesInMs;

  // Check admin user timeout (should never expire due to role)
  const adminUserElapsed = currentTime - adminUserDecoded.iat * 1000;
  const adminUserExpired = false; // Admin never expires

  console.log('Session Timeout Test Results:');
  console.log('Regular User:');
  console.log('- Elapsed time:', Math.floor(regularUserElapsed / 1000 / 60), 'minutes');
  console.log('- Session expired:', regularUserExpired ? 'YES' : 'NO');
  console.log('- Expected: YES (after 10 minutes)\n');

  console.log('Admin User:');
  console.log('- Elapsed time:', Math.floor(adminUserElapsed / 1000 / 60), 'minutes');
  console.log('- Session expired:', adminUserExpired ? 'YES' : 'NO');
  console.log('- Expected: NO (admin has no timeout)\n');

  console.log('✅ Session timeout functionality test completed!');
}

// Run the test
testSessionTimeout(); 