/**
 * Copyright (C) 2016-2026 Husain Alamri (H4n) and Xenolexia Foundation.
 * Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See LICENSE.
 */

/**
 * Web stub for react-native-screen-brightness
 * Brightness control is not available on web; BrightnessService already guards by Platform.OS.
 */

export default {
  setBrightness(_value: number): void {},
  getBrightness(): Promise<number> {
    return Promise.resolve(1);
  },
};
