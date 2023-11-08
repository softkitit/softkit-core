const nxPreset = require('@nx/jest/preset').default;

process.env.NESTJS_PROFILES = 'test';

module.exports = {
  ...nxPreset,
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    'node_modules',
    '__tests__',
    'jestGlobalMocks.ts',
    'migrations',
    '.module.ts',
    'database/seeds',
    'database/factories',
  ],
  coverageThreshold: {
    global: {
      lines: 100,
      statements: 100,
      functions: 100,
      branches: 100,
    },
  },
};
