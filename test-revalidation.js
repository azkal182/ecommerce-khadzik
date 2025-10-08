// Test script for on-demand revalidation
// Run this script to test the revalidation API endpoints

const baseUrl = 'http://localhost:3000'; // Adjust if your app runs on different port

async function testRevalidation() {
  console.log('🧪 Testing On-demand Revalidation API...\n');

  try {
    // Test 1: Revalidate all pages
    console.log('1. Testing revalidation of all pages...');
    const response1 = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'all'
      }),
    });

    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ All pages revalidation successful');
      console.log('Response:', data1);
    } else {
      console.log('❌ All pages revalidation failed:', response1.status);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Revalidate specific paths
    console.log('2. Testing revalidation of specific paths...');
    const response2 = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paths: ['/stores', '/']
      }),
    });

    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Specific paths revalidation successful');
      console.log('Response:', data2);
    } else {
      console.log('❌ Specific paths revalidation failed:', response2.status);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Test error handling
    console.log('3. Testing error handling...');
    const response3 = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Empty body should trigger error
    });

    if (response3.status === 400) {
      const data3 = await response3.json();
      console.log('✅ Error handling working correctly');
      console.log('Error response:', data3);
    } else {
      console.log('❌ Error handling not working as expected:', response3.status);
    }

    console.log('\n🎉 Revalidation API testing completed!');
    console.log('\n📝 To test revalidation in practice:');
    console.log('1. Create, update, or delete a product through the dashboard');
    console.log('2. Create, update, or delete a store through the dashboard');
    console.log('3. Create a category through the dashboard');
    console.log('4. Check the console logs for revalidation messages');
    console.log('5. Visit the affected pages to see updated content');

  } catch (error) {
    console.error('❌ Error testing revalidation:', error);
    console.log('\n💡 Make sure your development server is running on localhost:3000');
  }
}

// Run the test
testRevalidation();