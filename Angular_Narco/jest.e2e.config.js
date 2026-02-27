/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/e2e'],
  // Un seul fichier entry-point qui regroupe tous les tests
  testMatch: ['**/all.e2e.spec.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'e2e/tsconfig.e2e.json'
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testTimeout: 120000,
  verbose: true,
  // Forcer l'exécution dans un seul processus → le singleton Chrome est partagé
  maxWorkers: 1,
  reporters: ['default'],
  setupFilesAfterEnv: [],
  globalSetup: null,
  globalTeardown: null
};
