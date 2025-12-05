// Test RFQ Alert Engine directly
import RFQAlertEngine from './rfqAlertEngine.js';

// Test data
const testRFQ = {
    id: 'rfq1',
    rfqNumber: 'RFQ-TEST-001',
    title: 'Test RFQ',
    stage: 'waiting',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    budget: 50000,
    suppliers: [
        { id: 's1', name: 'Supplier A' },
        { id: 's2', name: 'Supplier B' },
        { id: 's3', name: 'Supplier C' }
    ],
    quotes: [
        { id: 'q1', totalPrice: 48000 }
    ]
};

console.log('=== Testing RFQ Alert Engine ===');
console.log('Test RFQ:', testRFQ);

const alerts = RFQAlertEngine.generateAlerts(testRFQ);
console.log('Generated Alerts:', alerts);
console.log('Number of alerts:', alerts.length);

if (alerts.length > 0) {
    alerts.forEach((alert, index) => {
        console.log(`\nAlert ${index + 1}:`);
        console.log(`  Type: ${alert.type}`);
        console.log(`  Severity: ${alert.severity}`);
        console.log(`  Message: ${alert.message}`);
    });
} else {
    console.log('\n❌ NO ALERTS GENERATED!');
    console.log('Checking conditions:');

    // Check deadline
    const now = new Date();
    const deadline = new Date(testRFQ.deadline);
    const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    console.log(`  Deadline: ${deadline}`);
    console.log(`  Days until deadline: ${daysUntilDeadline}`);
    console.log(`  Should trigger deadline alert: ${daysUntilDeadline <= 3}`);

    // Check responses
    const totalSuppliers = testRFQ.suppliers?.length || 0;
    const responsesReceived = testRFQ.quotes?.length || 0;
    const responseRate = totalSuppliers > 0 ? (responsesReceived / totalSuppliers) * 100 : 0;
    console.log(`  Total suppliers: ${totalSuppliers}`);
    console.log(`  Responses received: ${responsesReceived}`);
    console.log(`  Response rate: ${responseRate}%`);
    console.log(`  Should trigger low response alert: ${responseRate < 50 && responseRate > 0}`);
}

export default {};
