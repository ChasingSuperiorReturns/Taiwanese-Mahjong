/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'src/engine/**/*.ts',
    '!src/engine/**/*.d.ts',
  ],
  coverageThreshold: {
    'src/engine/scoring/': {
      lines: 95,
      branches: 90,
      functions: 95,
      statements: 95,
    },
  },
};
