/* eslint-disable */
export default {
  displayName: 'resource-plugin',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  setupFilesAfterEnv: ['../../jest.setup.js'],
  coverageThreshold: {
    global: {
      lines: 100,
      statements: 100,
      functions: 100,
      branches: 100,
    },
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/resource-plugin'
};
