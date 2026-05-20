// Jest configuration for the freemarker-vscode language server.
// See client/jest.config.js for the sibling client config.
module.exports = {
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(test|spec).ts'],
  transform: {
    '.ts': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx|json)$',
    'package.json',
  ],
  coverageReporters: ['cobertura', 'html', 'text'],
};
