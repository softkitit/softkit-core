/* eslint-disable */
export default {
  displayName: 'ftp-client',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  transformIgnorePatterns: ['/node_modules/(?!nest-typed-config)'],
  setupFilesAfterEnv: ['../../jest.setup.js'],
  coverageDirectory: '../../coverage/libs/ftp-client',
};
