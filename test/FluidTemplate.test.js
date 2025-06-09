/**
 * @jest-environment jsdom
 */

import { jest, describe, beforeAll, afterAll, beforeEach, afterEach, test, expect } from '@jest/globals';

// Remove direct import of FluidTemplate here, it will be dynamically imported in beforeEach

describe('FluidTemplate', () => {
  let FluidTemplate; // Will be assigned in beforeEach
  let mockXHR;
  let originalApiUrl;
  const defaultApiUrl = 'https://fake-api.com/api/render';
  let originalProcessEnv;


  beforeAll(() => {
    originalApiUrl = process.env.TYPO3FLUID_STORYBOOK_API_URL;
    // Store original process.env to avoid pollution across test files
    originalProcessEnv = { ...process.env };
  });

  afterAll(() => {
    process.env.TYPO3FLUID_STORYBOOK_API_URL = originalApiUrl;
    // Restore original process.env
    process.env = originalProcessEnv;
  });

  beforeEach(async () => { // Made async for dynamic import
    jest.resetModules(); // Reset modules to clear cache and module state for FluidTemplate
    const module = await import('../src/js/Typo3FluidToStorybook/template.js');
    FluidTemplate = module.FluidTemplate;

    // Set a default API URL for most tests
    process.env.TYPO3FLUID_STORYBOOK_API_URL = defaultApiUrl;

    mockXHR = {
      open: jest.fn(),
      send: jest.fn(),
      setRequestHeader: jest.fn(),
      status: 200,
      responseText: JSON.stringify({ html: '<div>Default HTML</div>' }), // Default success response
    };
    // Spy on window.XMLHttpRequest and return our mock
    // This needs to be done after resetModules potentially clears JSDOM's window or spies
    jest.spyOn(window, 'XMLHttpRequest').mockImplementation(() => mockXHR);
  });

  afterEach(() => {
    // Restore all mocks after each test
    jest.restoreAllMocks();
    // Reset API URL to undefined to ensure it's explicitly set by tests needing it
    delete process.env.TYPO3FLUID_STORYBOOK_API_URL;
  });

  test('should return rendered HTML on successful request', () => {
    const htmlContent = '<div>Hello World</div>';
    mockXHR.responseText = JSON.stringify({ html: htmlContent });

    const result = FluidTemplate({ templatePath: 'EXT:myext/Test.html' });

    expect(result).toBe(htmlContent);
    expect(mockXHR.open).toHaveBeenCalledWith('POST', defaultApiUrl, false);
    expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Accept', 'application/json');
    expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(mockXHR.send).toHaveBeenCalledTimes(1);
    const requestBody = JSON.parse(mockXHR.send.mock.calls[0][0]);
    expect(requestBody.templatePath).toBe('EXT:myext/Test.html');
  });

  test('should rewrite asset paths for typo3temp URLs', () => {
    process.env.TYPO3FLUID_STORYBOOK_API_URL = 'https://example.com/typo3/api/fluid/render';
    const rawHtml = '<img src="typo3temp/foo.jpg"> <a href="typo3temp/bar.css">Link</a>';
    const expectedHtml = '<img src="https://example.com/typo3temp/foo.jpg"> <a href="https://example.com/typo3temp/bar.css">Link</a>';
    mockXHR.responseText = JSON.stringify({ html: rawHtml });

    const result = FluidTemplate({ templatePath: 'EXT:myext/Assets.html' });

    // The DOMParser introduces its own formatting (e.g. full HTML document structure)
    // We need to check if the body's content matches the expected transformation
    const parser = new DOMParser();
    const parsedResult = parser.parseFromString(result, 'text/html');
    expect(parsedResult.body.innerHTML).toBe(expectedHtml);
  });

  test('should return specific error if TYPO3FLUID_STORYBOOK_API_URL is not defined', () => {
    delete process.env.TYPO3FLUID_STORYBOOK_API_URL; // Ensure it's undefined
    const result = FluidTemplate({ templatePath: 'EXT:myext/Test.html' });
    expect(result).toBe('Error: TYPO3FLUID_STORYBOOK_API_URL is not defined. Please set it in your .env file.');
  });

  test('should handle network error (status 0)', () => {
    mockXHR.status = 0;
    mockXHR.responseText = ''; // Typically empty for status 0
    const result = FluidTemplate({ templatePath: 'EXT:myext/Test.html' });
    expect(result).toBe(`Error: Could not connect to API. Check network, CORS settings, and TYPO3FLUID_STORYBOOK_API_URL (${defaultApiUrl}). (Status 0)`);
  });

  test('should handle API request failed (e.g., 500 status)', () => {
    mockXHR.status = 500;
    mockXHR.responseText = 'Internal Server Error';
    const result = FluidTemplate({ templatePath: 'EXT:myext/Test.html' });
    expect(result).toBe('Error: API request failed. Status: 500. Response: Internal Server Error');
  });

  test('should truncate long error responses for non-200 statuses', () => {
    mockXHR.status = 404;
    mockXHR.responseText = 'a'.repeat(300);
    const result = FluidTemplate({ templatePath: 'EXT:myext/Test.html' });
    expect(result).toBe(`Error: API request failed. Status: 404. Response: ${'a'.repeat(200)}...`);
  });

  test('should handle could not parse JSON response', () => {
    mockXHR.responseText = '{"html": "<div>Test"'; // Invalid JSON
    const result = FluidTemplate({ templatePath: 'EXT:myext/Test.html' });
    expect(result).toBe('Error: Could not parse JSON response from API. Raw response: {"html": "<div>Test"');
  });

    test('should truncate long raw responses for JSON parsing errors', () => {
    mockXHR.responseText = 'a'.repeat(300); // Invalid JSON and long
    const result = FluidTemplate({ templatePath: 'EXT:myext/Test.html' });
    expect(result).toBe(`Error: Could not parse JSON response from API. Raw response: ${'a'.repeat(200)}...`);
  });

  test('should handle API returned error in JSON response', () => {
    mockXHR.responseText = JSON.stringify({ error: 'Invalid template path from API' });
    const result = FluidTemplate({ templatePath: 'EXT:myext/Invalid.html' });
    expect(result).toBe('Error from TYPO3 API: Invalid template path from API');
  });

  describe('Request Body Construction', () => {
    test('should send correct request body with all options', () => {
      const options = {
        templatePath: 'EXT:myext/Path.html',
        variables: { key: 'value', nested: { num: 1 } },
        section: 'MySection',
        layout: 'MyLayout',
      };
      FluidTemplate(options);
      expect(mockXHR.send).toHaveBeenCalledTimes(1);
      const requestBody = JSON.parse(mockXHR.send.mock.calls[0][0]);
      expect(requestBody).toEqual(options);
    });

    test('should send correct request body with minimal options (only templatePath)', () => {
      const options = { templatePath: 'EXT:myext/Minimal.html' };
      FluidTemplate(options);
      expect(mockXHR.send).toHaveBeenCalledTimes(1);
      const requestBody = JSON.parse(mockXHR.send.mock.calls[0][0]);
      expect(requestBody).toEqual({
        templatePath: 'EXT:myext/Minimal.html',
        variables: {},
        section: '',
        layout: '',
      });
    });

    test('should send correct request body with some optional options', () => {
      const options = {
        templatePath: 'EXT:myext/Partial.html',
        variables: { item: 'test' },
        section: 'Content',
      };
      FluidTemplate(options);
      expect(mockXHR.send).toHaveBeenCalledTimes(1);
      const requestBody = JSON.parse(mockXHR.send.mock.calls[0][0]);
      expect(requestBody).toEqual({
        templatePath: 'EXT:myext/Partial.html',
        variables: { item: 'test' },
        section: 'Content',
        layout: '',
      });
    });
  });

  test('should handle HTML responses that are not strings gracefully', () => {
    mockXHR.responseText = JSON.stringify({ html: null }); // API returns null for html
    let result = FluidTemplate({ templatePath: 'EXT:myext/NullHtml.html' });
    // DOMParser(null).body.innerHTML would error, but our code defaults html to ''
    expect(result).toBe('');

    mockXHR.responseText = JSON.stringify({ html: undefined }); // API returns undefined for html
    result = FluidTemplate({ templatePath: 'EXT:myext/UndefinedHtml.html' });
    expect(result).toBe('');

    mockXHR.responseText = JSON.stringify({ html: 123 }); // API returns a number for html
    result = FluidTemplate({ templatePath: 'EXT:myext/NumberHtml.html' });
    // The code coerces html to string, then DOMParser makes it <body>123</body>
    expect(result).toBe('123');
  });

  test('should handle unexpected error during request processing', () => {
    // Simulate an error during request.send() or other synchronous part
    mockXHR.send = jest.fn(() => {
      throw new Error('Network send failure');
    });
    const result = FluidTemplate({ templatePath: 'EXT:myext/Test.html' });
    expect(result).toBe('Error: An unexpected error occurred while trying to fetch the Fluid template. Network send failure');
  });

});


// --- New Top-Level Describe Block for Caching Tests ---
describe('FluidTemplate Caching', () => {
  let CachingFluidTemplate; // Renamed to avoid potential confusion if logs were ever merged
  let cacheMockXHR;
  let originalApiUrl_cacheTest; // Separate env var management
  const defaultApiUrl_cacheTest = 'https://cache-test-api.com/render';
  let originalProcessEnv_cacheTest;

  beforeAll(() => {
    originalApiUrl_cacheTest = process.env.TYPO3FLUID_STORYBOOK_API_URL;
    originalProcessEnv_cacheTest = { ...process.env };
  });

  afterAll(() => {
    process.env.TYPO3FLUID_STORYBOOK_API_URL = originalApiUrl_cacheTest;
    process.env = originalProcessEnv_cacheTest;
  });

  beforeEach(async () => {
    jest.resetModules(); // Crucial for resetting module-level cache
    const module = await import('../src/js/Typo3FluidToStorybook/template.js');
    CachingFluidTemplate = module.FluidTemplate;

    process.env.TYPO3FLUID_STORYBOOK_API_URL = defaultApiUrl_cacheTest;

    cacheMockXHR = {
      open: jest.fn(),
      send: jest.fn(),
      setRequestHeader: jest.fn(),
      status: 200,
      // Default response for this suite, tests can override as needed
      responseText: JSON.stringify({ html: '<div>Cached HTML for Caching Suite</div>' }),
    };
    jest.spyOn(window, 'XMLHttpRequest').mockImplementation(() => cacheMockXHR);
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Clean up spies
    delete process.env.TYPO3FLUID_STORYBOOK_API_URL; // Clean up env var for next test
  });

  test('serves from cache on second identical call', () => {
    const params = { templatePath: 'EXT:myext/Cached.html', variables: { data: 'test' } };

    const result1 = CachingFluidTemplate(params);
    expect(cacheMockXHR.send).toHaveBeenCalledTimes(1);
    expect(result1).toBe('<div>Cached HTML for Caching Suite</div>');

    const result2 = CachingFluidTemplate(params);
    expect(cacheMockXHR.send).toHaveBeenCalledTimes(1); // Should not be called again
    expect(result2).toBe('<div>Cached HTML for Caching Suite</div>');
  });

  test('fetches new data if parameters change', () => {
    const params1 = { templatePath: 'EXT:myext/First.html', variables: { v: 1 } };
    const params2 = { templatePath: 'EXT:myext/Second.html', variables: { v: 2 } };

    CachingFluidTemplate(params1);
    expect(cacheMockXHR.send).toHaveBeenCalledTimes(1);

    cacheMockXHR.responseText = JSON.stringify({ html: '<div>New HTML</div>' });
    const result2 = CachingFluidTemplate(params2);
    expect(cacheMockXHR.send).toHaveBeenCalledTimes(2);
    expect(result2).toBe('<div>New HTML</div>');
  });

  test('does not cache API error responses (status 500)', () => {
    const params = { templatePath: 'EXT:myext/ErrorTest.html' };
    cacheMockXHR.status = 500;
    cacheMockXHR.responseText = 'Server Error';

    const errorResult = CachingFluidTemplate(params);
    expect(errorResult).toBe(`Error: API request failed. Status: 500. Response: Server Error`);
    expect(cacheMockXHR.send).toHaveBeenCalledTimes(1);

    cacheMockXHR.status = 200;
    cacheMockXHR.responseText = JSON.stringify({ html: '<div>Success after error</div>' });

    const successResult = CachingFluidTemplate(params);
    expect(cacheMockXHR.send).toHaveBeenCalledTimes(2);
    expect(successResult).toBe('<div>Success after error</div>');
  });

  test('does not cache API error responses (JSON error field)', () => {
    const params = { templatePath: 'EXT:myext/JsonError.html' };
    cacheMockXHR.status = 200;
    cacheMockXHR.responseText = JSON.stringify({ error: 'API error message' });

    const errorResult = CachingFluidTemplate(params);
    expect(errorResult).toBe('Error from TYPO3 API: API error message');
    expect(cacheMockXHR.send).toHaveBeenCalledTimes(1);

    cacheMockXHR.responseText = JSON.stringify({ html: '<div>Success after JSON error</div>' });

    const successResult = CachingFluidTemplate(params);
    expect(cacheMockXHR.send).toHaveBeenCalledTimes(2);
    expect(successResult).toBe('<div>Success after JSON error</div>');
  });

  test('does not cache if API URL is not defined', () => {
    delete process.env.TYPO3FLUID_STORYBOOK_API_URL;
    const params = { templatePath: 'EXT:myext/NoApiUrl.html' };

    const errorResult = CachingFluidTemplate(params);
    expect(errorResult).toBe('Error: TYPO3FLUID_STORYBOOK_API_URL is not defined. Please set it in your .env file.');
    expect(cacheMockXHR.send).not.toHaveBeenCalled();

    process.env.TYPO3FLUID_STORYBOOK_API_URL = defaultApiUrl_cacheTest;
    cacheMockXHR.responseText = JSON.stringify({ html: '<div>Success after no API URL</div>' });

    const successResult = CachingFluidTemplate(params);
    expect(cacheMockXHR.send).toHaveBeenCalledTimes(1);
    expect(successResult).toBe('<div>Success after no API URL</div>');
  });

  test('cache keys differentiate based on all parameters', () => {
    const baseParams = { templatePath: 'EXT:myext/Diff.html', variables: { v: 1 }, section: 's1', layout: 'l1' };

    CachingFluidTemplate(baseParams);
    CachingFluidTemplate({ ...baseParams, templatePath: 'EXT:myext/Diff2.html' });
    CachingFluidTemplate({ ...baseParams, variables: { v: 2 } });
    CachingFluidTemplate({ ...baseParams, section: 's2' });
    CachingFluidTemplate({ ...baseParams, layout: 'l2' });

    expect(cacheMockXHR.send).toHaveBeenCalledTimes(5);
  });
});
