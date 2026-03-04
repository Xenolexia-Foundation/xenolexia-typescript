#!/usr/bin/env node
/**
 * Run ensure-translations-resolved.js every 4 hours until no language has the
 * MyMemory warning in its data. Run in background: node scripts/run-every-4h-until-resolved.js
 */

const { execSync } = require('child_process');
const path = require('path');

const SCRIPT = path.join(__dirname, 'ensure-translations-resolved.js');
const INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours

function run() {
  console.log(`[${new Date().toISOString()}] Running ensure-translations-resolved...`);
  execSync(`node "${SCRIPT}"`, {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  while (true) {
    try {
      run();
    } catch (e) {
      console.error(e);
    }
    if (process.env.STOP_AFTER_ONE === '1') {
      console.log('STOP_AFTER_ONE=1, exiting after one run.');
      process.exit(0);
    }
    console.log(`[${new Date().toISOString()}] Sleeping 4 hours...`);
    await sleep(INTERVAL_MS);
  }
}

main();
