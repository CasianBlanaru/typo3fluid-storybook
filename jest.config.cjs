// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Already established as needed
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  // An array of file extensions your modules use
  moduleFileExtensions: ["ts", "js", "json", "node"],
  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  // moduleNameMapper: {
  //   '^@/(.*)$': '<rootDir>/src/$1', // Example if using path aliases in tests
  // },
  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/__tests__/**/*.ts",
    "**/?(*.)+(spec|test).ts"
  ],
  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      // ts-jest configuration options go here
      // For example, to ensure it uses the project's tsconfig.json:
      tsconfig: 'tsconfig.json',
      // To handle ESM better if issues arise (though preset usually handles this)
      // useESM: true, // This requires further ESM setup in Jest if enabled
    }],
  },
  // Indicates whether each individual test should be reported during the run
  verbose: true,
};
