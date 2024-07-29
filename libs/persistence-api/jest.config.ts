/* eslint-disable */
export default {
  displayName: 'persistence-api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  setupFilesAfterEnv: ['../../jest.setup.js'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  transformIgnorePatterns: ['/node_modules/(?!nest-typed-config)'],
  coverageDirectory: '../../coverage/libs/persistence-api',
};
