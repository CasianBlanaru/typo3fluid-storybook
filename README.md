
# TYPO3Fluid-Storybook-JS-Integration

Render TYPO3 Fluid templates inside Storybook.

This package provides a way to integrate TYPO3 Fluid templates into Storybook, enabling frontend developers to work seamlessly with TYPO3 Fluid components in a modern development environment.

---

## Features

- Render TYPO3 Fluid templates directly in Storybook.
- Support for TYPO3 v12.
- Simplified integration for TYPO3-driven projects.
- Build modern, component-based frontend designs while staying connected to TYPO3.

**Note:** This integration primarily targets **TYPO3 v12**. While it might work with other versions, v12 is the officially supported and tested version.

---

## Installation and Setup

### Prerequisites

*   **Node.js:** A recent LTS version is recommended (e.g., v18.x or v20.x). The CI environment for this project uses v22.x.
*   **Storybook:** Version `^8.5.0` or compatible (as per `package.json`).
*   **TYPO3 CMS:** Version v12 is currently supported. The integration relies on a corresponding TYPO3 extension that provides the Fluid rendering API.
*   **TYPO3 Extension for Fluid Rendering:** A TYPO3 extension that exposes a `/fluid/render` (or similar) API endpoint is required. This endpoint is responsible for rendering Fluid templates and returning the HTML output.

### TYPO3 Setup (Fluid Rendering API)

To use Fluid templates in Storybook, you need a TYPO3 extension that exposes your Fluid templates via an API endpoint. This endpoint will be called by the Storybook integration to fetch the rendered HTML.

Here's a conceptual example of what this API endpoint should do:

*   **Endpoint:** e.g., `https://your-typo3-site.com/api/fluid/render`
*   **Method:** `POST`
*   **Request Body (JSON):**
    ```json
    {
      "templatePath": "EXT:myext/Resources/Private/Templates/MyTemplate.html",
      "variables": {
        "key1": "value1",
        "anotherKey": {
          "nested": "value"
        }
      },
      "section": "OptionalSectionName",
      "layout": "OptionalLayoutName"
    }
    ```
*   **Response Body (JSON):**
    ```json
    {
      "html": "<p>Rendered HTML of the Fluid template...</p>",
      "error": "Error message if rendering failed, otherwise null or empty."
    }
    ```
*   **Functionality:**
    *   The endpoint must resolve `EXT:` prefixed paths to the correct file locations within your TYPO3 installation.
    *   It should render the specified Fluid template (`templatePath`) using the provided `variables`.
    *   It should support rendering specific sections (`section`) or using particular layouts (`layout`) if your Fluid templates utilize them.
    *   **Asset Path Rewriting:** If your Fluid templates reference assets (CSS, JS, images) that are typically processed by TYPO3 and stored in `typo3temp/` or similar versioned/cached directories, the API endpoint (or the Fluid rendering logic within TYPO3) should rewrite these paths to be accessible from the Storybook environment. The `FluidTemplate.js` script in this integration already includes logic to prepend the TYPO3 host to paths starting with `typo3temp/`. Ensure your API output is consistent with this, or adjust the script as needed.
*   **Security:** It is highly recommended to create a dedicated, possibly authenticated, API endpoint for rendering Fluid templates. This helps prevent unauthorized access and potential misuse.

### Storybook Integration Steps

1.  **Install the package/Include the FluidTemplate Utility:**

    Currently, this project is set up as an addon/utility. To use the `FluidTemplate.js` renderer:

    *   Copy the `src/js/Typo3FluidToStorybook/template.js` file into your Storybook project. A common location is `.storybook/typo3FluidTemplates.js`.

2.  **Configure Environment Variable:**

    *   Create a `.env` file in the root directory of your Storybook project if it doesn't already exist.
    *   Add the `TYPO3FLUID_STORYBOOK_API_URL` variable to your `.env` file, pointing to your TYPO3 Fluid rendering endpoint.
        ```
        TYPO3FLUID_STORYBOOK_API_URL=https://your-typo3-site.com/api/fluid/render
        ```
    *   Ensure your Storybook setup loads this `.env` file. Modern Storybook versions using Vite (like this project) typically load `.env` files by default.

3.  **Usage in Stories:**

    *   Import the `FluidTemplate` function in your Storybook stories. If you placed the file as suggested:
        ```javascript
        import FluidTemplate from '.storybook/typo3FluidTemplates';
        ```
    *   Use the `FluidTemplate` function to render your TYPO3 Fluid templates. Refer to the 'Usage Example' section below for a detailed guide.

---

## API Documentation: `FluidTemplate(options)`

This section details the `FluidTemplate` function, which is the core utility for rendering TYPO3 Fluid templates in Storybook.

### Function Signature

The function is typically imported into your story files and called with an options object:

```javascript
import FluidTemplate from '.storybook/typo3FluidTemplates'; // Adjust path if you placed it elsewhere

const options = {
  templatePath: 'EXT:your_ext/Resources/Private/Templates/MyComponent.html',
  variables: { /* ... */ },
  // section: 'OptionalSection',
  // layout: 'OptionalLayout'
};

const htmlOutput = FluidTemplate(options);
```

### `options` Object Parameters

The `FluidTemplate` function accepts a single object argument with the following properties:

*   `templatePath` (string, **required**):
    *   The full path to the Fluid template file, typically using the `EXT:` prefix for TYPO3 extensions.
    *   Example: `EXT:my_extension/Resources/Private/Partials/MyPartial.html`

*   `variables` (object, optional):
    *   A JavaScript object containing key-value pairs that will be passed as variables to the Fluid template.
    *   Nested objects and arrays are supported, provided your TYPO3 Fluid rendering endpoint can correctly process them and assign them to the template.
    *   Example:
        ```javascript
        variables: {
          header: 'Welcome to Our Component!',
          items: [
            { name: 'First Item', link: '/first' },
            { name: 'Second Item', link: '/second' }
          ],
          settings: {
            theme: 'dark',
            showImages: true
          }
        }
        ```

*   `section` (string, optional):
    *   The name of a specific section within your Fluid template that you wish to render.
    *   If omitted, the entire template (or its default section) is rendered.
    *   Example: `section: 'Content'`

*   `layout` (string, optional):
    *   The name of a layout file (without the `.html` extension) that the Fluid template should use.
    *   This corresponds to `<f:layout name="MyLayout" />` in Fluid.
    *   Example: `layout: 'DefaultLayout'`

### Return Value

*   **On Success (string):** Returns an HTML string representing the rendered Fluid template content.
*   **On Failure (string):** Returns an error message string. This can originate from:
    *   The `FluidTemplate` function itself (e.g., "Error: TYPO3FLUID_STORYBOOK_API_URL environment variable is not set.").
    *   The network request (e.g., "Error: Failed to fetch template - 404: Not Found").
    *   The TYPO3 Fluid rendering API (e.g., an error message JSON property like `{"html": "", "error": "Fluid template not found."}`).

### Interaction with TYPO3 Fluid API

1.  **API Endpoint:** The `FluidTemplate` function relies on the `TYPO3FLUID_STORYBOOK_API_URL` environment variable, which you must configure in your Storybook project's `.env` file. This URL should point to your TYPO3 instance's Fluid rendering endpoint.

2.  **Request:**
    *   It makes a **synchronous** `POST` request to the specified API URL.
    *   The body of the request is a JSON object containing the `templatePath`, `variables`, `section`, and `layout` parameters passed to the function:
        ```json
        {
          "templatePath": "EXT:...",
          "variables": { "...": "..." },
          "section": "OptionalSection",
          "layout": "OptionalLayout"
        }
        ```

3.  **Response:**
    *   The TYPO3 API endpoint is expected to return a JSON response with the following structure:
        ```json
        {
          "html": "<!-- Rendered HTML content -->",
          "error": "Error message if any, otherwise null or an empty string"
        }
        ```
    *   If the `error` field in the response contains a message, this message will be returned by `FluidTemplate`. Otherwise, the `html` content is returned.

4.  **Asset Path Rewriting:**
    *   The `FluidTemplate.js` script includes logic to automatically prepend the TYPO3 base URL (derived by taking the `origin` from `TYPO3FLUID_STORYBOOK_API_URL`) to relative asset paths it finds in the returned HTML that point to `typo3temp/`.
    *   For example, if the API returns `src="typo3temp/assets/image.jpg"` and your API URL is `https://my-typo3.com/api/fluid`, the path will be rewritten to `src="https://my-typo3.com/typo3temp/assets/image.jpg"`. This helps ensure assets are loaded correctly within the Storybook iframe.

---

## Usage Example

This example demonstrates how to integrate a TYPO3 Fluid template (`PersonsListTeaserFluid`) into Storybook for rendering and interactive customization.

### Fluid Template Import

The Fluid renderer is imported using the `FluidTemplate` function (assuming you've copied `template.js` to `.storybook/typo3FluidTemplates.js` as suggested in the setup):

```javascript
import FluidTemplate from '.storybook/typo3FluidTemplates';
```

### Define the Fluid Template Path

Specify the path to the Fluid template:

```javascript
const PersonsListTeaserFluidpath = 'EXT:your_ext/Resources/Private/Partials/List/Item.html';
```

### Default Arguments

Define default values for the template variables:

```javascript
const defaultArgs = {
    fullName: 'Max Mustermann',
    image: 'https://placehold.co/400x400/cc006e/white',
    detailPage: '/detail-page',
    position: 'Professor',
    work: 'Lehrt Physik und Mathematik',
    officeHours: 'Mo-Fr 10-12 Uhr',
    telephone: '+49 30 12345678',
    room: 'B-123',
    email: 'max.mustermann@example.com',
};
```

### Storybook Configuration

The `PersonsListTeaserFluid` story is exported for use in Storybook:

```javascript
export default {
    title: 'Molecules/PersonsListTeaserFluid',
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        fullName: { control: 'text', defaultValue: defaultArgs.fullName },
        image: { control: 'text', defaultValue: defaultArgs.image },
        detailPage: { control: 'text', defaultValue: defaultArgs.detailPage },
        position: { control: 'text', defaultValue: defaultArgs.position },
        work: { control: 'text', defaultValue: defaultArgs.work },
        officeHours: { control: 'text', defaultValue: defaultArgs.officeHours },
        telephone: { control: 'text', defaultValue: defaultArgs.telephone },
        room: { control: 'text', defaultValue: defaultArgs.room },
        email: { control: 'text', defaultValue: defaultArgs.email },
    },
};
```

### Define the Template

Create a template function that renders the Fluid template:

```javascript
const Template = (args) => {
    const html = FluidTemplate({
        templatePath: PersonsListTeaserFluidpath,
        variables: {
            person: {
                fullName: args.fullName,
                image: args.image,
                detailPage: args.detailPage,
                position: { title: args.position },
                work: args.work,
                officeHours: args.officeHours,
                telephone: args.telephone,
                room: args.room,
                email: args.email,
            },
        },
    });

    return `<div>${html}</div>`;
};
```

### Export the Story

The story is exported and connected to the default arguments:

```javascript
export const PersonsListTeaserFluid = Template.bind({});
PersonsListTeaserFluid.args = {
    ...defaultArgs,
};

### Using Complex `argTypes` (Objects and Arrays)

Storybook's `argTypes` allow for detailed configuration of controls, including those for complex data types like objects and arrays. These can be effectively used with `FluidTemplate` to pass structured data to your Fluid components.

When working with JavaScript (as opposed to TypeScript), you might need to explicitly set the `control` type in `argTypes` to `'object'` or `'array'` for Storybook to render the appropriate UI control. Otherwise, it might default to a simple text input for complex types.

Below is an example demonstrating how to configure `argTypes` for object and array inputs and pass them to `FluidTemplate`.

**Example Storybook Story:**

```javascript
// In your .stories.js file

import FluidTemplate from '.storybook/typo3FluidTemplates'; // Adjust path if needed

export default {
  title: 'Components/ComplexFluidComponent',
  // component: FluidTemplate, // Optional: You can set the component for better integration if needed
  parameters: {
    layout: 'padded', // Or 'centered', 'fullscreen'
  },
  argTypes: {
    templatePath: {
      control: 'text',
      defaultValue: 'EXT:my_ext/Resources/Private/Templates/ComplexComponent.html',
    },
    userData: {
      control: 'object', // Explicitly set control type for objects
      defaultValue: {
        name: 'Jane Doe',
        roles: ['Editor', 'Reviewer'],
        id: 123,
        isActive: true,
        address: { street: '123 Main St', city: 'Storybook City' }
      },
    },
    items: {
      control: 'array',  // Explicitly set control type for arrays
      defaultValue: [
        { title: 'First Item', value: 'val1', data: { count: 10 } },
        { title: 'Second Item', value: 'val2', data: { count: 25 } },
        { title: 'Third Item', value: 'val3', data: { count: 5 } },
      ],
    },
    // Example of a simple text argType, which might also be a variable for Fluid
    pageTitle: {
        control: 'text',
        defaultValue: 'My Complex Component View'
    }
  },
};

const Template = (args) => {
  // Destructure args to separate template-specific variables from others
  const { templatePath, userData, items, pageTitle, ...otherStorybookArgs } = args;

  // This log helps you see any other args passed by Storybook in the browser console
  console.log("Other Storybook Args not passed to Fluid:", otherStorybookArgs);

  const fluidVariables = {
    user: userData,    // Pass the object to the template variable 'user'
    itemList: items,   // Pass the array to the template variable 'itemList'
    title: pageTitle,  // Pass the simple string to 'title'
    // You could also define some fixed/static variables here if needed:
    // staticSetting: 'enabled',
    // featureFlags: { newLayout: true }
  };

  const htmlOutput = FluidTemplate({
    templatePath: templatePath,
    variables: fluidVariables,
  });

  // It's good practice to wrap the raw HTML output, especially if it might not have a single root element
  return `<div class="story-wrapper">${htmlOutput}</div>`;
};

export const Default = Template.bind({});
// Default.args will be automatically populated from argTypes.defaultValue.
// You can override specific args here for a particular story variation if needed:
// Default.args = {
//   ...Default.args, // This line is not strictly needed as Storybook does this
//   userData: { name: 'John Doe', roles: ['Admin'], id: 1, isActive: false, address: { street: '456 Another St', city: 'Testville'} },
//   items: [{ title: 'Special Item', value: 'special', data: { count: 100 } }]
// };

// Example of a story with a specific variation
export const AdminUser = Template.bind({});
AdminUser.args = {
    // templatePath is inherited from argTypes.defaultValue if not specified
    userData: {
        name: 'Admin User',
        roles: ['Administrator', 'SuperUser'],
        id: 789,
        isActive: true,
        address: { street: '1 Admin Road', city: 'Control Panel' }
    },
    items: [
        { title: 'Admin Task 1', value: 'task_a', data: { priority: 'high' } },
        { title: 'Admin Task 2', value: 'task_b', data: { priority: 'medium' } },
    ],
    pageTitle: "Admin View - Complex Component"
};
```

**Conceptual Fluid Template Snippet:**

This is a conceptual look at how `EXT:my_ext/Resources/Private/Templates/ComplexComponent.html` might consume the variables passed above.

```html
<!-- EXT:my_ext/Resources/Private/Templates/ComplexComponent.html (Conceptual) -->
<h2>{title}</h2>

<div class="user-profile" style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
  <h3>User: {user.name} (ID: {user.id})</h3>
  <p>Status: <f:if condition="{user.isActive}">Active</f:if><f:else>Inactive</f:else></p>
  <p>Address: {user.address.street}, {user.address.city}</p>
  <p>Roles:</p>
  <ul>
    <f:for each="{user.roles}" as="role">
      <li>{role}</li>
    </f:for>
  </ul>
</div>

<div class="item-list" style="border: 1px solid #ccc; padding: 10px;">
  <h4>Items ({itemList -> f:count()} items):</h4>
  <ul>
    <f:for each="{itemList}" as="item">
      <li>
        <strong>{item.title}</strong> (Value: {item.value})
        <br />
        <small>Data Count: {item.data.count -> f:if(condition: '{item.data.count}', else: 'N/A')}</small>
        <f:if condition="{item.data.priority}">
            (Priority: {item.data.priority})
        </f:if>
      </li>
    </f:for>
  </ul>
  <f:if condition="{itemList -> f:count()} == 0">
      <p>No items to display.</p>
  </f:if>
</div>
``
---

## Benefits

- **Interactive Testing**: Test Fluid templates dynamically in Storybook.
- **Decoupled Development**: Render TYPO3 Fluid templates without a fully loaded TYPO3 environment.
- **Modern Workflow**: Enable modern component-based frontend development.

---

## Automated Fluid Template Discovery

To simplify the process of finding and referencing Fluid templates in your Storybook stories, this project includes a discovery script.

### Overview

The script (`scripts/discover-fluid-templates.js`) scans specified TYPO3 extension directories for Fluid template files (`.html`). It then generates a JSON map where keys are convenient aliases for the templates and values are their full `EXT:extension_key/...` paths.

This JSON map can be imported into your Storybook setup (e.g., in `preview.js` or individual stories) to provide an easy way to select or switch between Fluid templates, especially for `argTypes` controls.

### Installation Notes

The script is located at `scripts/discover-fluid-templates.js`. It uses the `minimist` package for command-line argument parsing. If you've cloned this repository and run `npm install`, `minimist` (being a dependency of this package, or it should be added as a devDependency if frequently used for scripts) should be available.

The script is designed to be run in a Node.js environment.

### Usage

To run the script, use the following command-line syntax:

```bash
node scripts/discover-fluid-templates.js --extensions <paths_to_extensions> [--output <output_file_path>]
```

**Arguments:**

*   `--extensions <paths_to_extensions>`: **(Required)**
    *   A comma-separated list of local file system paths to your TYPO3 extension directories.
    *   Ensure there are no spaces around the commas if providing multiple paths.
    *   Example:
        ```bash
        node scripts/discover-fluid-templates.js --extensions "path/to/typo3conf/ext/my_site_package,../another_project/typo3conf/ext/my_other_extension"
        ```
    *   Or for a single extension:
        ```bash
        node scripts/discover-fluid-templates.js --extensions "./path/to/your_extension"
        ```

*   `--output <output_file_path>`: (Optional)
    *   The file path where the generated JSON map of templates will be saved.
    *   Defaults to: `.storybook/fluid-templates.json`.
    *   Example:
        ```bash
        node scripts/discover-fluid-templates.js --extensions "path/to/ext" --output "config/fluid_template_map.json"
        ```

The script will log its progress, including any errors (like invalid paths) and a summary of templates found.

### Output Format

The script generates a JSON file containing an object.
*   **Keys:** Generated aliases for each Fluid template. The alias format is `PascalCaseExtensionKey_DirectoryType_Path_FileName`.
    *   `PascalCaseExtensionKey`: The extension key, converted to PascalCase (e.g., `my_extension` becomes `MyExtension`).
    *   `DirectoryType`: Can be `Templates`, `Partials`, or `Layouts`.
    *   `Path_FileName`: The relative path to the template file within its directory type, with directory separators (`/` or `\`) replaced by underscores, and the `.html` extension removed.
    *   Example alias: `MySitePackage_Templates_Page_Default` or `MyExtension_Partials_Common_Header`.
*   **Values:** The full `EXT:extension_key/Path/To/Template.html` string for the corresponding Fluid template.

**Example JSON Output (`.storybook/fluid-templates.json`):**

```json
{
  "MySitePackage_Templates_Content_TextMedia": "EXT:my_site_package/Resources/Private/Templates/Content/TextMedia.html",
  "MySitePackage_Partials_Navigation_MainMenu": "EXT:my_site_package/Resources/Private/Partials/Navigation/MainMenu.html",
  "AnotherExt_Templates_MyElement": "EXT:another_ext/Resources/Private/Templates/MyElement.html"
}
```

### Using the Generated JSON in Storybook Stories

Once you have generated the `fluid-templates.json` file (or your custom named output file), you can import it into your Storybook stories to create a dynamic template selector. This allows you to easily switch between different Fluid templates using Storybook's Controls addon.

**Example Storybook Story (`.stories.js`):**

```javascript
// Example: src/stories/FluidTemplateViewer.stories.js

// Adjust the path to where you copied FluidTemplate.js
import FluidTemplate from '../../.storybook/typo3FluidTemplates';
// Adjust the path to your generated JSON file
import templatePathsByName from '../../.storybook/fluid-templates.json';

export default {
  title: 'TYPO3 Fluid Viewer',
  parameters: {
    layout: 'padded', // Or 'centered', 'fullscreen'
  },
  argTypes: {
    selectedTemplate: {
      name: 'Select Fluid Template',
      description: 'Choose a Fluid template to render. The paths are sourced from the generated JSON file.',
      control: 'select',
      options: Object.keys(templatePathsByName), // Display aliases in the dropdown
      mapping: templatePathsByName, // Map the selected alias to its full EXT:path string
    },
    // --- Example Fluid Variables ---
    // Add argTypes for variables that your Fluid templates might commonly use.
    // These will appear as controls in Storybook.
    headline: {
      name: 'Headline Text',
      control: 'text',
      defaultValue: 'Welcome to Fluid in Storybook!',
      description: 'A headline variable often used in templates.',
    },
    text: {
      name: 'Body Text',
      control: 'text', // 'text' for long text, or 'string' for short
      defaultValue: 'This is some sample text passed as a variable to the Fluid template.',
    },
    // Example of an object variable for more complex data
    author: {
      name: 'Author Data (Object)',
      control: 'object',
      defaultValue: {
        name: 'Max Mustermann',
        email: 'max.mustermann@example.com',
        role: 'Content Editor'
      }
    }
  },
};

const Template = (args) => {
  // Destructure args: selectedTemplate is the full EXT:path due to 'mapping'
  // Other args are collected into 'fluidVariables' to be passed to the template
  const { selectedTemplate, ...fluidVariables } = args;

  if (!selectedTemplate || Object.keys(templatePathsByName).length === 0) {
    if (Object.keys(templatePathsByName).length === 0) {
      return `
        <div style="padding: 20px; border: 1px dashed #ccc; background-color: #f9f9f9;">
          <strong>No Fluid templates found in the JSON map.</strong>
          <p>Please run the discovery script: <code>node scripts/discover-fluid-templates.js --extensions "path/to/your/extensions"</code></p>
        </div>
      `;
    }
    return `
      <div style="padding: 20px; border: 1px solid #eee; background-color: #fafafa;">
        <p>Please select a Fluid template from the "Select Fluid Template" control in the Controls panel.</p>
      </div>
    `;
  }

  // Call FluidTemplate with the chosen template path and the rest of the args as variables
  const htmlOutput = FluidTemplate({
    templatePath: selectedTemplate,
    variables: fluidVariables,
  });

  return `<div class="fluid-story-render">${htmlOutput}</div>`;
};

export const Viewer = Template.bind({});

// Determine the first available template alias for default selection
const availableTemplateAliases = Object.keys(templatePathsByName);
const defaultTemplateAlias = availableTemplateAliases.length > 0 ? availableTemplateAliases[0] : undefined;

Viewer.args = {
  // Set the default selected template using its alias.
  // Storybook will use the 'mapping' to pass the actual EXT:path to the Template function.
  selectedTemplate: defaultTemplateAlias,
  // Default values for other variables are taken from argTypes.defaultValue
  // but can be overridden here if needed for this specific story.
  // headline: "Custom Headline for this Story",
};

// Add a note about keeping the JSON file updated
if (Object.keys(templatePathsByName).length > 0) {
    Viewer.parameters = {
        ...Viewer.parameters,
        notes: `This story uses a dynamic list of Fluid templates from \`fluid-templates.json\`.
                If you add or remove templates in your TYPO3 extensions, remember to re-run
                the \`scripts/discover-fluid-templates.js\` script to update the list.`,
    };
}
```

**Explanation:**

1.  **Import Templates:** The generated JSON file (`fluid-templates.json` in this example) is imported. This provides an object where keys are the user-friendly aliases and values are the actual `EXT:` paths.
2.  **Configure `argTypes`:**
    *   An `argType` (e.g., `selectedTemplate`) is configured with `control: 'select'`.
    *   `options: Object.keys(templatePathsByName)` populates the select dropdown with the template aliases from the JSON file.
    *   `mapping: templatePathsByName` tells Storybook that when an alias is selected from the dropdown, the actual value passed to the story's `args` (and thus to the `Template` function) should be the corresponding value (the `EXT:` path) from the `templatePathsByName` object.
3.  **Template Function:**
    *   The `Template` function receives the actual `EXT:` path in `args.selectedTemplate` because of the `mapping`.
    *   It checks if a template is selected and, if so, calls `FluidTemplate` with this path and any other args as variables.
4.  **Default Selection:** The story's default `args` can be set to select the first template found in the JSON map, ensuring a template is rendered by default.
5.  **Keep Updated:** Remember to re-run the `discover-fluid-templates.js` script whenever you add, remove, or rename Fluid templates in your TYPO3 extensions to keep the `fluid-templates.json` file and your Storybook template selector up-to-date.

This setup provides a powerful way to browse and test all your discovered Fluid templates directly within Storybook using a simple dropdown control.

---

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---

## License

This package is licensed under the MIT License.

---

## Credits

Developed by Casian Blanaru. Inspired by TYPO3 and Storybook integration workflows.
