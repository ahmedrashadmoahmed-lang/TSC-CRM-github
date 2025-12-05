// Test AI Categorization
const { categorizeInvoiceItem, generateInvoiceDescription } = require('./src/lib/ai');

async function testAI() {
  console.log('🧪 Testing Google Gemini AI Integration...\n');

  try {
    // Test 1: Categorize item
    console.log('Test 1: Item Categorization');
    const category = await categorizeInvoiceItem('Laptop Dell XPS 15');
    console.log('✅ Category:', category);
    console.log('');

    // Test 2: Generate description
    console.log('Test 2: Generate Description');
    const description = await generateInvoiceDescription('Office supplies purchase');
    console.log('✅ Description:', description);
    console.log('');

    console.log('🎉 All AI tests passed!');
  } catch (error) {
    console.error('❌ AI Test Failed:', error.message);
  }
}

testAI();
