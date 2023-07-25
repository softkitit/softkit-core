const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      lines: 100,
      statements: 85,
      functions: 85,
      branches: 70,
    },
  },
};
