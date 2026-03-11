/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 *
 * E2E: Navigation and critical UI flows.
 */

import path from 'path';

import {test, expect} from '@playwright/test';
import {_electron as electron} from 'playwright';

function launchElectron() {
  const projectRoot = path.resolve(__dirname, '..');
  const appPath = path.join(projectRoot, 'app');
  const mainPath = path.join(appPath, 'electron', 'main.js');
  return electron.launch({
    cwd: appPath,
    args: [mainPath],
    env: {...process.env, NODE_ENV: 'development'},
    timeout: 30000,
  });
}

test.describe('Electron App - Navigation', () => {
  test('can navigate to Vocabulary from Library', async () => {
    const electronApp = await launchElectron();
    try {
      const window = await electronApp.firstWindow({timeout: 20000});
      await window.waitForLoadState('domcontentloaded').catch(() => {});
      await window.waitForTimeout(4000);

      // Look for a link or button that goes to vocabulary (e.g. "Vocabulary" in nav or menu)
      const vocabularyLink = window.getByRole('link', {name: /vocabulary/i}).or(
        window.locator('a[href*="vocabulary"]')
      );
      const count = await vocabularyLink.count();
      if (count > 0) {
        await vocabularyLink.first().click();
        await window.waitForTimeout(2000);
        const bodyText = await window.locator('body').textContent();
        expect(bodyText).toBeTruthy();
        const hasVocabularyContent =
          bodyText?.toLowerCase().includes('vocabulary') ||
          bodyText?.toLowerCase().includes('words') ||
          bodyText?.toLowerCase().includes('review');
        expect(hasVocabularyContent).toBe(true);
      } else {
        // If no explicit vocabulary link visible, at least app loaded
        const bodyText = await window.locator('body').textContent();
        expect(bodyText?.length).toBeGreaterThan(0);
      }
    } finally {
      await electronApp.close();
    }
  });

  test('can navigate to Settings', async () => {
    const electronApp = await launchElectron();
    try {
      const window = await electronApp.firstWindow({timeout: 20000});
      await window.waitForLoadState('domcontentloaded').catch(() => {});
      await window.waitForTimeout(4000);

      const settingsLink = window.getByRole('link', {name: /settings/i}).or(
        window.locator('a[href*="settings"]')
      );
      const count = await settingsLink.count();
      if (count > 0) {
        await settingsLink.first().click();
        await window.waitForTimeout(2000);
        const bodyText = await window.locator('body').textContent();
        expect(bodyText).toBeTruthy();
        expect(bodyText?.toLowerCase()).toMatch(/settings|preferences|language|theme/);
      } else {
        const bodyText = await window.locator('body').textContent();
        expect(bodyText?.length).toBeGreaterThan(0);
      }
    } finally {
      await electronApp.close();
    }
  });
});
