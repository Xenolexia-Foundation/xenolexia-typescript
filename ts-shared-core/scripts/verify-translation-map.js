/**
 * Verifies translation map accuracy by round-trip checks (S → T → S').
 * Run after building the core: npm run build && node scripts/verify-translation-map.js
 * Writes verification-report.json and prints a summary to stdout.
 */

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');
let getVerificationReport;
let SUPPORTED_LANGUAGES;
try {
  const data = require(path.join(distPath, 'data', 'index.js'));
  const types = require(path.join(distPath, 'types', 'index.js'));
  getVerificationReport = data.getVerificationReport;
  SUPPORTED_LANGUAGES = types.SUPPORTED_LANGUAGES;
} catch (e) {
  console.error('Failed to load core from', distPath);
  console.error(e.message || e);
  console.error('Run "npm run build" in ts-shared-core first.');
  process.exit(1);
}
if (!getVerificationReport || !SUPPORTED_LANGUAGES) {
  console.error('Core missing getVerificationReport or SUPPORTED_LANGUAGES');
  process.exit(1);
}

const nonEn = SUPPORTED_LANGUAGES.map((l) => l.code).filter((c) => c !== 'en');
const reports = [];
let totalPairs = 0;
let totalPassed = 0;
let totalFailed = 0;
let bridgePairs = 0;
let bridgePassed = 0;
let bridgeFailed = 0;

for (let i = 0; i < nonEn.length; i++) {
  for (let j = 0; j < nonEn.length; j++) {
    if (i === j) continue;
    const source = nonEn[i];
    const target = nonEn[j];
    const report = getVerificationReport(source, target);
    if (!report) continue;
    totalPairs++;
    totalPassed += report.passed;
    totalFailed += report.failed;
    if (source !== 'en' && target !== 'en') {
      bridgePairs++;
      bridgePassed += report.passed;
      bridgeFailed += report.failed;
    }
    reports.push(report);
  }
}

const outPath = path.join(__dirname, 'verification-report.json');
fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), reports }, null, 2));
console.log('Verification report written to', outPath);
console.log('');
console.log('Summary:');
console.log('  All pairs (en included):', totalPairs, 'pairs,', totalPassed, 'passed,', totalFailed, 'failed');
console.log('  Bridge-only (S→T, both non-en):', bridgePairs, 'pairs,', bridgePassed, 'passed,', bridgeFailed, 'failed');
if (bridgePairs > 0 && bridgeFailed > 0) {
  const failedReports = reports.filter((r) => r.failed > 0 && r.source !== 'en' && r.target !== 'en');
  console.log('  Pairs with at least one failed entry:', failedReports.length);
  failedReports.slice(0, 10).forEach((r) => {
    console.log('    ', r.source, '→', r.target, ':', r.passed, '/', r.total, 'passed');
  });
  if (failedReports.length > 10) {
    console.log('    ... and', failedReports.length - 10, 'more');
  }
}
