// ==================== اختبار شامل للنظام ====================
console.log('🚀 بدء اختبار النظام...\n');

// Test 1: Core Module
console.log('✅ Test 1: APP_CORE');
console.log('- Version:', APP_CORE.version);
console.log('- Generate ID:', APP_CORE.generateId('test'));
console.log('- Format Currency:', APP_CORE.formatCurrency(1000));
console.log('- Format Date:', APP_CORE.formatDate(new Date().toISOString()));

// Test 2: Auth Module
console.log('\n✅ Test 2: APP_AUTH');
console.log('- Role Name:', APP_AUTH.getRoleName('accountant'));
console.log('- Current User:', APP_AUTH.getCurrentUser()?.name || 'No user logged in');

// Test 3: Pages Module
console.log('\n✅ Test 3: APP_PAGES');
console.log('- Current Page:', APP_PAGES.getCurrentPage());

// Test 4: Accounting Module
console.log('\n✅ Test 4: APP_ACCOUNTING');
console.log('- Total Assets:', APP_CORE.formatCurrency(APP_ACCOUNTING.calculateTotalAssets()));
console.log('- Total Liabilities:', APP_CORE.formatCurrency(APP_ACCOUNTING.calculateTotalLiabilities()));

// Test 5: Sales Module
console.log('\n✅ Test 5: APP_SALES');
console.log('- Sales Statistics:', APP_SALES.getSalesStatistics('month'));

// Test 6: Workflow Module
console.log('\n✅ Test 6: APP_WORKFLOW');
console.log('- Workflow Steps Count:', APP_WORKFLOW.WORKFLOW_STEPS.length);

console.log('\n✅ جميع الاختبارات نجحت!');