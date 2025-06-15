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

interface FluidTemplateOptions {
  templatePath?: string;
  section?: string;
  layout?: string;
  variables?: Record<string, any>;
}

interface ApiRequestBody {
  templatePath?: string;
  section?: string;
  layout?: string;
  variables?: Record<string, any>;
}

interface ApiResponse {
  html?: any; // Can be string, number, boolean, null from API; will be stringified or defaulted
  error?: string;
}

const fluidTemplateCache: Map<string, string> = new Map();

export const FluidTemplate = ({
  templatePath = '',
  section = '',
  layout = '',
  variables = {},
}: FluidTemplateOptions): string => {
  const cacheKeyParams: FluidTemplateOptions = { templatePath, variables, section, layout };
  const cacheKey: string = JSON.stringify(cacheKeyParams);

  if (fluidTemplateCache.has(cacheKey)) {
    // Type assertion as we know we store strings
    return fluidTemplateCache.get(cacheKey) as string;
  }

  const apiUrl: string = process.env.TYPO3FLUID_STORYBOOK_API_URL ?? '';
  if (!apiUrl) {
    return 'Error: TYPO3FLUID_STORYBOOK_API_URL is not defined. Please set it in your .env file.';
  }

  const requestBody: ApiRequestBody = {
    templatePath,
    variables,
    section,
    layout,
  };

  try {
    const request: XMLHttpRequest = new XMLHttpRequest();
    request.open('POST', apiUrl, false); // `false` makes the request synchronous
    request.setRequestHeader('Accept', 'application/json');
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(requestBody));

    if (request.status === 200) {
      let response: ApiResponse;
      try {
        response = JSON.parse(request.responseText) as ApiResponse;
      } catch (error: any) { // Catch as 'any' or 'unknown' then check type
        const truncatedResponse: string = request.responseText && request.responseText.length > 200
          ? `${request.responseText.substring(0, 200)}...`
          : request.responseText;
        return `Error: Could not parse JSON response from API. Raw response: ${truncatedResponse}`;
      }

      if (response.error) {
        return `Error from TYPO3 API: ${response.error}`;
      }

      // Convert html response to string, defaulting null/undefined to empty string.
      // Primitives like numbers/booleans will be stringified.
      let html: string = response.html === null || typeof response.html === 'undefined' ? '' : String(response.html);

      const baseUrlMatch: RegExpMatchArray | null = apiUrl.match(/^(.*)(?=\/)/);
      let baseUrl: string = '';
      if (baseUrlMatch && baseUrlMatch[0]) {
          try {
            const urlObject: URL = new URL(apiUrl);
            baseUrl = `${urlObject.protocol}//${urlObject.host}/`;
          } catch (e) {
             const pathParts: string[] = apiUrl.split('/');
             if (pathParts.length > 3) {
                baseUrl = `${pathParts.slice(0, 3).join('/')}/`;
             } else {
                baseUrl = apiUrl;
             }
          }
      } else {
          baseUrl = '/';
      }

      html = html.replace(
        /src="typo3temp\/([^"]+)"/g,
        (match: string, pathCapture: string) => `src="${baseUrl}typo3temp/${pathCapture}"`
      );
      html = html.replace(
        /href="typo3temp\/([^"]+)"/g,
        (match: string, pathCapture: string) => `href="${baseUrl}typo3temp/${pathCapture}"`
      );

      const parser: DOMParser = new DOMParser();
      const parsedHtml: Document = parser.parseFromString(html, 'text/html');
      const formattedHtml: string = parsedHtml.body ? parsedHtml.body.innerHTML : html;

      if (response.html !== undefined && !response.error) {
        fluidTemplateCache.set(cacheKey, formattedHtml);
      }
      return formattedHtml;
    } else if (request.status === 0) {
      return `Error: Could not connect to API. Check network, CORS settings, and TYPO3FLUID_STORYBOOK_API_URL (${apiUrl}). (Status 0)`;
    } else {
      const truncatedResponse: string = request.responseText && request.responseText.length > 200
        ? `${request.responseText.substring(0, 200)}...`
        : request.responseText;
      return `Error: API request failed. Status: ${request.status}. Response: ${truncatedResponse}`;
    }
  } catch (e: any) { // Catch as 'any' or 'unknown' then check type
    const errorMessage = e instanceof Error ? e.message : String(e);
    return `Error: An unexpected error occurred while trying to fetch the Fluid template. ${errorMessage}`.trim();
  }
};

export default FluidTemplate;
