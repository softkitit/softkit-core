/* eslint-disable */
import type { Config } from 'jest';

export default {
  displayName: 'softkit',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  transformIgnorePatterns: ['/node_modules/(?!nest-typed-config)', '/node_modules/(?!globby)'],
  setupFilesAfterEnv: ['../../jest.setup.js'],
  coverageDirectory: '../../coverage/libs/softkit',
} satisfies Config;
