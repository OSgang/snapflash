module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/backend/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'screens/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!app/_layout.tsx',
    '!app/(tabs)/_layout.tsx',
    '!app/modal.tsx',
    '!app/database/**',
  ],
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './test-report',
        filename: 'index.html',
        expand: true,
      },
    ],
  ],
};
