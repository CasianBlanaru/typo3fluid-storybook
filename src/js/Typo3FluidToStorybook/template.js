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
    console.error('API URL is not defined in .env file');
    return 'Error: API URL is not configured';
  }

  console.log('API URL:', apiUrl);

  const requestBody = {
    templatePath,
    variables,
    section,
    layout,
  };

  console.log('Request Body:', JSON.stringify(requestBody, null, 2));

  const request = new XMLHttpRequest();
  request.open('POST', apiUrl, false);
  request.setRequestHeader('Accept', 'application/json');
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.stringify(requestBody));

  console.log('Request Status:', request.status);
  console.log('Raw Response Text:', request.responseText);

  if (request.status === 200) {
    let response;
    try {
      response = JSON.parse(request.responseText);
    } catch (error) {
      console.error('Error parsing response:', error);
      return request.responseText;
    }

    if (response.error) {
      console.error('Response Error:', response.error);
      return response.error;
    }

    const baseUrl = apiUrl.replace(/\/fluid\/render$/, '/');
    let html = response.html;
    html = html.replace(
      /src="(typo3temp\/[^"]+)"/g,
      (match, path) => `src="${baseUrl}${path}"`
    );
    html = html.replace(
      /href="(typo3temp\/[^"]+)"/g,
      (match, path) => `href="${baseUrl}${path}"`
    );

    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(html, 'text/html');
    const formattedHtml = parsedHtml.body.innerHTML;

    console.log(
      '%cFormatted HTML:',
      'color: purple; font-weight: bold; text-decoration: underline; background-color: #f4f4f4; padding: 4px;',
      formattedHtml
    );

    return html;
  }

  console.error('Non-200 HTTP status:', request.status);
  return `Error: ${request.responseText}`;
};

export default FluidTemplate;
