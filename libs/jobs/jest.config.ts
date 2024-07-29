/* eslint-disable */
export default {
  displayName: 'jobs',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      lines: 100,
      statements: 100,
      functions: 100,
      branches: 80,
    },
  },
  transformIgnorePatterns: ['/node_modules/(?!nest-typed-config)'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  setupFilesAfterEnv: ['../../jest.setup.js'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/jobs'
};
