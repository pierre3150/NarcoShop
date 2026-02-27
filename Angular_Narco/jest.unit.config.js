/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.unit.spec.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.spec.json',
      diagnostics: false
    }]
  },
  // Ne pas transformer les node_modules sauf rxjs (ESM)
  transformIgnorePatterns: [
    'node_modules/(?!(rxjs)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 15000,
  verbose: true,
  maxWorkers: 1,
  reporters: ['default']
};
