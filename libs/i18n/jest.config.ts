export default {
  displayName: 'i18n',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  coverageThreshold: {
    global: {
      statements: 88,
      branches: 75,
      functions: 90,
      lines: 88,
    },
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/i18n',
};
