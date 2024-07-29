export default {
  displayName: 'logger',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transformIgnorePatterns: ['/node_modules/(?!nest-typed-config)'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  setupFilesAfterEnv: ['../../jest.setup.js'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/logger',
};
