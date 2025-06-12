# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-06-09

### Added
- Detailed "Installation and Setup" guide to `README.md`, including TYPO3 API setup, prerequisites, and Storybook integration steps.
- Comprehensive API documentation for the `FluidTemplate` function in `README.md`, covering parameters, return values, and API interaction.
- Jest unit tests for the `FluidTemplate` function, including tests for success cases, error handling, and asset path rewriting.
- `@storybook/addon-a11y` for accessibility testing in Storybook.
- Documentation in `README.md` for using complex `argTypes` (objects, arrays) with `FluidTemplate` in Storybook stories.
- GitHub issue templates for Bug Reports (`.github/ISSUE_TEMPLATE/BUG_REPORT.md`) and Feature Requests (`.github/ISSUE_TEMPLATE/FEATURE_REQUEST.md`).
- Initial `CHANGELOG.md` file.

### Changed
- Improved error handling in the `FluidTemplate` function to provide more specific and user-friendly error messages and removed excessive console logging.
- Updated `README.md` import paths for `FluidTemplate` to be consistent with new setup instructions.

### Fixed
- Corrected asset path rewriting logic in `FluidTemplate.js` for `typo3temp/` assets (discovered via unit tests).
- Ensured `FluidTemplate.js` correctly handles primitive non-string `html` content from the API (e.g., numbers) by stringifying them (discovered via unit tests).

### Removed
- Old placeholder `test/example.test.js`.
- Redundant "Requirements" section from `README.md` (merged into "Installation and Setup").
