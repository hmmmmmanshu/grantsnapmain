/**
 * Test script for Pro user check functionality
 * This script tests the isProUser function with different scenarios
 */

// Test data - replace with actual values from your system
const TEST_USERS = {
  proUser: {
    id: 'e4be836e-0276-4e02-b7a3-e597fe3c3fcb',
    email: 'pro@example.com'
  },
  basicUser: {
    id: '96220101-79c0-46d9-afb5-14126295ef35',
    email: 'basic@example.com'
  }
};

/**
 * Test the Pro user check endpoint
 */
async function testProUserCheck() {
  console.log('🧪 Testing Pro User Check Functionality\n');

  // Test 1: Pro user should have access
  console.log('Test 1: Pro User Access');
  try {
    const proUserToken = await getAuthToken(TEST_USERS.proUser.email);
    const proUserResult = await testEdgeFunction(proUserToken, 'trigger-deep-scan');
    console.log('✅ Pro user result:', proUserResult.status === 403 ? 'BLOCKED (unexpected)' : 'ALLOWED (expected)');
  } catch (error) {
    console.log('❌ Pro user test failed:', error.message);
  }

  // Test 2: Basic user should be blocked
  console.log('\nTest 2: Basic User Access (Should be blocked)');
  try {
    const basicUserToken = await getAuthToken(TEST_USERS.basicUser.email);
    const basicUserResult = await testEdgeFunction(basicUserToken, 'trigger-deep-scan');
    console.log('✅ Basic user result:', basicUserResult.status === 403 ? 'BLOCKED (expected)' : 'ALLOWED (unexpected)');
  } catch (error) {
    console.log('❌ Basic user test failed:', error.message);
  }

  // Test 3: Invalid token should be blocked
  console.log('\nTest 3: Invalid Token (Should be blocked)');
  try {
    const invalidTokenResult = await testEdgeFunction('invalid-token', 'trigger-deep-scan');
    console.log('✅ Invalid token result:', invalidTokenResult.status === 403 ? 'BLOCKED (expected)' : 'ALLOWED (unexpected)');
  } catch (error) {
    console.log('❌ Invalid token test failed:', error.message);
  }

  // Test 4: No token should be blocked
  console.log('\nTest 4: No Token (Should be blocked)');
  try {
    const noTokenResult = await testEdgeFunction(null, 'trigger-deep-scan');
    console.log('✅ No token result:', noTokenResult.status === 403 ? 'BLOCKED (expected)' : 'ALLOWED (unexpected)');
  } catch (error) {
    console.log('❌ No token test failed:', error.message);
  }
}

/**
 * Get authentication token for a user
 */
async function getAuthToken(email) {
  // This would normally call your auth endpoint
  // For testing, you'll need to manually get a valid token
  console.log(`🔑 Getting auth token for: ${email}`);
  
  // Return a placeholder - replace with actual token
  return 'your-actual-jwt-token-here';
}

/**
 * Test an Edge Function with the given token
 */
async function testEdgeFunction(token, functionName) {
  const url = `https://your-project.supabase.co/functions/v1/${functionName}`;
  
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      grant_id: 'test-grant-id',
      url_to_scan: 'https://example.com'
    })
  });

  return {
    status: response.status,
    body: await response.json()
  };
}

/**
 * Test the refine-ai-answer function as well
 */
async function testRefineAIAnswer() {
  console.log('\n🧪 Testing Refine AI Answer Function\n');

  // Test with Pro user
  try {
    const proUserToken = await getAuthToken(TEST_USERS.proUser.email);
    const result = await testRefineAIAnswerFunction(proUserToken);
    console.log('✅ Refine AI Answer result:', result.status === 403 ? 'BLOCKED (unexpected)' : 'ALLOWED (expected)');
  } catch (error) {
    console.log('❌ Refine AI Answer test failed:', error.message);
  }
}

/**
 * Test the refine-ai-answer Edge Function
 */
async function testRefineAIAnswerFunction(token) {
  const url = 'https://your-project.supabase.co/functions/v1/refine-ai-answer';
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      original_answer: 'Test answer',
      refinement_style: 'concise',
      question_context: 'Test question',
      limit_object: { type: 'words', value: 100 }
    })
  });

  return {
    status: response.status,
    body: await response.json()
  };
}

// Run tests
console.log('🚀 Starting Pro User Check Tests...\n');
testProUserCheck().then(() => {
  console.log('\n✅ All tests completed!');
}).catch(error => {
  console.error('\n❌ Test suite failed:', error);
});

// Test refine-ai-answer function
testRefineAIAnswer().then(() => {
  console.log('\n✅ Refine AI Answer tests completed!');
}).catch(error => {
  console.error('\n❌ Refine AI Answer tests failed:', error);
});
