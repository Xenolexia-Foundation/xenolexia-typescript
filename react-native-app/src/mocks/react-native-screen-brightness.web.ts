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
