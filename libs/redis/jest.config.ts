/* eslint-disable */
export default {
  displayName: 'redis',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transformIgnorePatterns: ['/node_modules/(?!nest-typed-config)'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/redis'
};
