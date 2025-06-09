/**
 * Renders a TYPO3 Fluid template by sending a POST request to the configured API URL.
 *
 * @param {Object} options - The options for rendering the template.
 * @param {string} [options.templatePath=''] - The path to the Fluid template.
 * @param {string} [options.section=''] - The section of the template to render.
 * @param {string} [options.layout=''] - The layout to use for the template.
 * @param {Object} [options.variables={}] - The variables to pass to the template.
 * @returns {string} The rendered HTML or an error message.
 */
export const FluidTemplate = ({
  templatePath = '',
  section = '',
  layout = '',
  variables = {},
}) => {
  const apiUrl = process.env.TYPO3FLUID_STORYBOOK_API_URL ?? '';
  if (!apiUrl) {
    return 'Error: TYPO3FLUID_STORYBOOK_API_URL is not defined. Please set it in your .env file.';
  }

  const requestBody = {
    templatePath,
    variables,
    section,
    layout,
  };

  try {
    const request = new XMLHttpRequest();
    request.open('POST', apiUrl, false); // `false` makes the request synchronous
    request.setRequestHeader('Accept', 'application/json');
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(requestBody));

    if (request.status === 200) {
      let response;
      try {
        response = JSON.parse(request.responseText);
      } catch (error) {
        const truncatedResponse = request.responseText && request.responseText.length > 200
          ? `${request.responseText.substring(0, 200)}...`
          : request.responseText;
        return `Error: Could not parse JSON response from API. Raw response: ${truncatedResponse}`;
      }

      if (response.error) {
        return `Error from TYPO3 API: ${response.error}`;
      }

      // Convert html response to string, defaulting null/undefined to empty string.
      // Primitives like numbers/booleans will be stringified.
      let html = response.html === null || typeof response.html === 'undefined' ? '' : String(response.html);

      // Attempt to derive baseUrl for asset rewriting.
      // This regex will match up to the last '/' before 'fluid/render' or similar API paths.
      const apiPathRegex = /\/(?:fluid\/render|api\/fluid|[^/]+)$/;
      const baseUrlMatch = apiUrl.match(/^(.*)(?=\/)/); // Get everything before the last segment
      let baseUrl = '';
      if (baseUrlMatch && baseUrlMatch[0]) {
          // If apiUrl is "https://example.com/foo/bar/api/fluid/render",
          // we want "https://example.com/" not "https://example.com/foo/bar/api/fluid/"
          // We need to make sure the API path is correctly removed.
          // A simple way: use URL object if available, or a more robust regex for common patterns.
          try {
            const urlObject = new URL(apiUrl);
            baseUrl = `${urlObject.protocol}//${urlObject.host}/`; // Results in "https://example.com/"
          } catch (e) {
            // Fallback for environments where URL global might not be standard (less common now)
            // or if apiUrl is not a full URL.
            // This fallback is simplistic and might need adjustment based on expected apiUrl structures.
             const pathParts = apiUrl.split('/');
             if (pathParts.length > 3) { // http: / / domain / ...
                baseUrl = `${pathParts.slice(0, 3).join('/')}/`;
             } else {
                baseUrl = apiUrl; // Or handle as error / warning
             }
          }
      } else {
          // If apiUrl is very simple, e.g. "/api/fluid/render" (relative path, though not expected for .env)
          // then baseUrl might be empty or need different handling. For now, assume full URL.
          baseUrl = '/'; // Default to root relative if base URL extraction fails.
      }

      // Prepend baseUrl to typo3temp paths
      html = html.replace(
        /src="typo3temp\/([^"]+)"/g,
        (match, path) => `src="${baseUrl}typo3temp/${path}"`
      );
      html = html.replace(
        /href="typo3temp\/([^"]+)"/g,
        (match, path) => `href="${baseUrl}typo3temp/${path}"`
      );

      // The DOMParser and formatting step seems to be for debugging or specific display needs.
      // If it's purely for debugging, it could be removed.
      // If it's for ensuring the HTML is well-formed or extracting body content, it can stay.
      // For now, it's kept as it was, but this could be a point of simplification if not strictly needed.
      const parser = new DOMParser();
      const parsedHtml = parser.parseFromString(html, 'text/html');
      // Ensure parsedHtml.body exists before trying to access innerHTML
      const formattedHtml = parsedHtml.body ? parsedHtml.body.innerHTML : html;

      return formattedHtml; // Return the potentially modified HTML
    } else if (request.status === 0) {
      return `Error: Could not connect to API. Check network, CORS settings, and TYPO3FLUID_STORYBOOK_API_URL (${apiUrl}). (Status 0)`;
    } else {
      const truncatedResponse = request.responseText && request.responseText.length > 200
        ? `${request.responseText.substring(0, 200)}...`
        : request.responseText;
      return `Error: API request failed. Status: ${request.status}. Response: ${truncatedResponse}`;
    }
  } catch (e) {
    // Catch any unexpected errors during request setup or other synchronous operations
    // that are not related to the HTTP request status itself.
    return `Error: An unexpected error occurred while trying to fetch the Fluid template. ${e.message || ''}`.trim();
  }
};

export default FluidTemplate;
