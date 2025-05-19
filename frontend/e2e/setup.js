// e2e/setup.js
const { device } = require('detox');

beforeAll(async () => {
  await device.launchApp();
});