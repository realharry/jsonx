import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

// Mock Jest globals
const testResults: { description: string; status: string; error?: string }[] = [];
let currentDescribe: string[] = [];

const describe = (description: string, fn: () => void) => {
  currentDescribe.push(description);
  fn();
  currentDescribe.pop();
};

const it = async (description: string, fn: () => Promise<void> | void) => {
  const fullDescription = [...currentDescribe, description].join(' ');
  try {
    await fn();
    testResults.push({ description: fullDescription, status: 'PASSED' });
  } catch (error: any) {
    console.error(`Error in test "${fullDescription}":`, error);
    testResults.push({ description: fullDescription, status: 'FAILED', error: error.stack || error.message });
  }
};

const expect = (received: any) => {
  return {
    toEqual: (expected: any) => {
      if (received !== expected) {
        throw new Error(`Expected\n"${expected}"\nbut received\n"${received}"`);
      }
    },
    // Add other matchers as needed, e.g., toBe, toContain, etc.
  };
};

async function runTests() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  // Prefer the compiled JS test when running from `dist/`, otherwise load the TS source
  const jsCandidate = path.resolve(currentDir, 'jsonx.test.js');
  const tsCandidate = path.resolve(currentDir, 'jsonx.test.ts');
  const testFilePath = fs.existsSync(jsCandidate) ? jsCandidate : tsCandidate;
  const { runJsonxTests } = await import(pathToFileURL(testFilePath).href);
  runJsonxTests(describe, it, expect);

  console.log('\n--- Test Results ---');
  testResults.forEach(result => {
    if (result.status === 'PASSED') {
      console.log(`✅ ${result.description}`);
    } else {
      console.error(`❌ ${result.description}`);
      console.error(`   Error: ${result.error}`);
    }
  });

  const failedTests = testResults.filter(r => r.status === 'FAILED').length;
  if (failedTests > 0) {
    console.error(`\n${failedTests} test(s) FAILED`);
    process.exit(1);
  } else {
    console.log('\nAll tests PASSED');
    process.exit(0);
  }
}

runTests();
