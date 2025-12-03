import { fileURLToPath } from 'url';
import path from 'path';
// Mock Jest globals
const testResults = [];
let currentDescribe = [];
const describe = (description, fn) => {
    currentDescribe.push(description);
    fn();
    currentDescribe.pop();
};
const it = async (description, fn) => {
    const fullDescription = [...currentDescribe, description].join(' ');
    try {
        await fn();
        testResults.push({ description: fullDescription, status: 'PASSED' });
    }
    catch (error) {
        console.error(`Error in test "${fullDescription}":`, error);
        testResults.push({ description: fullDescription, status: 'FAILED', error: error.stack || error.message });
    }
};
const expect = (received) => {
    return {
        toEqual: (expected) => {
            if (received !== expected) {
                throw new Error(`Expected\n"${expected}"\nbut received\n"${received}"`);
            }
        },
        // Add other matchers as needed, e.g., toBe, toContain, etc.
    };
};
async function runTests() {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const testFilePath = path.resolve(currentDir, 'src/jsonx.test.ts'); // Note: .ts extension here
    const { runJsonxTests } = await import(fileURLToPath(new URL(testFilePath, import.meta.url)));
    runJsonxTests(describe, it, expect);
    console.log('\n--- Test Results ---');
    testResults.forEach(result => {
        if (result.status === 'PASSED') {
            console.log(`✅ ${result.description}`);
        }
        else {
            console.error(`❌ ${result.description}`);
            console.error(`   Error: ${result.error}`);
        }
    });
    const failedTests = testResults.filter(r => r.status === 'FAILED').length;
    if (failedTests > 0) {
        console.error(`\n${failedTests} test(s) FAILED`);
        process.exit(1);
    }
    else {
        console.log('\nAll tests PASSED');
        process.exit(0);
    }
}
runTests();
