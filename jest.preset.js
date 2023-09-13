const nxPreset = require('@nx/jest/preset').default;

process.env.NESTJS_PROFILES = 'test';
jest.setTimeout(10000);

module.exports = {
  ...nxPreset,
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      lines: 100,
      statements: 100,
      functions: 100,
      branches: 100,
    },
  },
};
