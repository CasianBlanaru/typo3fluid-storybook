
# TYPO3Fluid-Storybook-JS-Integration

Render TYPO3 Fluid templates inside Storybook.

This package provides a way to integrate TYPO3 Fluid templates into Storybook, enabling frontend developers to work seamlessly with TYPO3 Fluid components in a modern development environment.
The core logic is now written in **TypeScript** for improved maintainability and type safety.

---

## Features

- Render TYPO3 Fluid templates directly in Storybook (core function now in TypeScript).
- Support for TYPO3 v12.
- Simplified integration for TYPO3-driven projects.
- Build modern, component-based frontend designs while staying connected to TYPO3.
- In-memory caching for `FluidTemplate` function to boost performance on repeated renders.
- Automated discovery script for Fluid templates within your TYPO3 extensions.

**Note:** While this integration was initially developed with TYPO3 v12 in mind, it is designed to be compatible with TYPO3 versions 10.x, 11.x, and 12.x. See the "TYPO3 Version Compatibility" section for more details.

---

## Installation and Setup

### Prerequisites

*   **Node.js:** A recent LTS version is recommended (e.g., v18.x or v20.x). The CI environment for this project uses v22.x.
*   **Storybook:** Version `^8.5.0` or compatible (as per `package.json`).
*   **TYPO3 CMS:** Supported versions: v12.x, v11.x, v10.x. The integration relies on a corresponding TYPO3 extension that provides the Fluid rendering API.
*   **TYPO3 Extension for Fluid Rendering:** A TYPO3 extension that exposes a `/fluid/render` (or similar) API endpoint is required. This endpoint is responsible for rendering Fluid templates and returning the HTML output.

### TYPO3 Version Compatibility

This integration tool is designed to work with TYPO3 versions 10.x, 11.x, and 12.x. The successful integration across these TYPO3 versions primarily depends on your ability to implement the server-side Fluid rendering API endpoint.

*   **API Contract:** The core `FluidTemplate` utility (client-side) communicates with your user-defined API endpoint. This endpoint must adhere to the expected JSON contract (see "API Documentation: `FluidTemplate(options)`" for request/response details).
*   **Server-Side Implementation:** The specific PHP classes (e.g., for `StandaloneView`) and methods for creating API endpoints (e.g., PSR-15 middleware, eID, Extbase Controller Actions) may vary between TYPO3 versions. You should consult the official TYPO3 documentation for your specific version when implementing this server-side endpoint.
*   **Client-Side Consistency:** No specific client-side code changes in this package are typically needed for different TYPO3 versions, provided the API contract is met.
*   **Testing:** Users are encouraged to test their specific Fluid features and ViewHelpers with their chosen TYPO3 version, as behavior in a headless/API-rendered context might occasionally differ from full frontend rendering.

### TYPO3 Setup (Fluid Rendering API)

To use Fluid templates in Storybook, you need a TYPO3 extension that exposes your Fluid templates via an API endpoint (as detailed under "Prerequisites" and "TYPO3 Version Compatibility"). This endpoint will be called by the Storybook integration to fetch the rendered HTML. Remember to adapt your endpoint implementation based on your TYPO3 version (v10, v11, or v12) and its best practices.

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

1.  **Using the `FluidTemplate` Utility:**

    The primary utility is the `FluidTemplate` function. This project is built as a library. After building the project (`npm run build`), you can use the output from the `dist` folder.
    The `package.json` is configured with `main` and `module` fields, so if you install this package from npm (once published) or link it locally, you should be able to import it like:

    ```typescript
    import FluidTemplate from 'typo3fluid2storybook-addon'; // Or your package name
    ```

    For local development or if you prefer to copy the utility:
    *   The source file is now `src/ts/Typo3FluidToStorybook/template.ts`.
    *   After running `npm run build`, the compiled, usable JavaScript versions are in `dist/main.es.js` and `dist/main.umd.js`.
    *   You could copy one of these (e.g., `dist/main.es.js`) into your Storybook setup, for example, to `.storybook/typo3FluidTemplates.js`, and then import it:
        ```typescript
        // Assuming you copied dist/main.es.js to .storybook/typo3FluidTemplates.js
        import FluidTemplate from './typo3FluidTemplates.js';
        ```
    It's generally recommended to consume the package through standard package management practices.

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

To improve performance and reduce redundant API calls, `FluidTemplate` implements an in-memory caching mechanism.

**Caching Behavior:**

*   **Scope:** Rendered HTML output from successful API calls is cached for the duration of the browser session (i.e., as long as the Storybook JavaScript environment is not reloaded).
*   **Cache Key:** The cache key is generated based on a combination of all input parameters: `templatePath`, `variables` (deeply stringified), `section`, and `layout`. Any change to these parameters will result in a new API request rather than serving from the cache.
*   **Functionality:**
    *   Successful template renders are cached.
    *   If an API call results in an error (e.g., network error, non-200 status, or an error message within the API's JSON response), the error response is **not** cached. Subsequent identical requests will re-attempt to fetch from the API.
*   **Controls:** Currently, the cache operates automatically. There are no manual controls for clearing, disabling, or configuring the cache.

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

Assuming you are using the `FluidTemplate` function, either by importing it from the package or by copying the built file (e.g., to `.storybook/typo3FluidTemplates.js`):

```

### Define the Fluid Template Path

Specify the path to the Fluid template:

```javascript
const PersonsListTeaserFluidpath = 'EXT:your_ext/Resources/Private/Partials/List/Item.html';
```

### Default Arguments

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

The story configuration remains similar, but you can leverage types.

```typescript
// Assuming this is in a .stories.ts file
import type { Meta, StoryObj } from '@storybook/html';
// import FluidTemplate from 'typo3fluid2storybook-addon'; // or your import path

// Define your arg types using the interface
const meta: Meta<PersonTeaserArgs> = {
    title: 'Molecules/PersonsListTeaserFluid',
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        fullName: { control: 'text' }, // defaultValue can be omitted if set in meta.args or story.args
        image: { control: 'text' },
        detailPage: { control: 'text' },
        position: { control: 'text' },
        work: { control: 'text' },
        officeHours: { control: 'text' },
        telephone: { control: 'text' },
        room: { control: 'text' },
        email: { control: 'text' },
    },
    args: defaultArgs, // Set default args for all stories from this meta
};
export default meta;

type Story = StoryObj<PersonTeaserArgs>;
```

### Define the Template

Create a template function that renders the Fluid template.

```typescript
const PersonsListTeaserFluidpath = 'EXT:your_ext/Resources/Private/Partials/List/Item.html';

const TemplateFunction = (args: PersonTeaserArgs) => {
    // Assume FluidTemplate is imported
    // const FluidTemplate = window.FluidTemplate; // Example if loaded globally, adjust import as needed

    const html = FluidTemplate({ // FluidTemplate is the function from this package
        templatePath: PersonsListTeaserFluidpath,
        variables: {
            person: { // Assuming your Fluid template expects a 'person' object
                fullName: args.fullName,
                image: args.image,
                detailPage: args.detailPage,
                position: { title: args.position }, // Example of nesting if needed
                work: args.work,
                officeHours: args.officeHours,
                telephone: args.telephone,
                room: args.room,
                email: args.email,
            },
        },
    });

    // Storybook expects a string or a DOM element
    const container = document.createElement('div');
    container.innerHTML = html;
    return container; // Or just return html string: return `<div>${html}</div>`;
};
```

### Export the Story

Export stories using the typed `StoryObj`.

```typescript
export const PersonsListTeaserFluid: Story = {
  render: TemplateFunction,
  // args can be set here to override meta.args or provide specific values
  // args: {
  //   ...defaultArgs,
  //   fullName: "Erika Mustermann",
  // }
};

export const AdminUser: ComplexStory = {
  render: ComplexTemplate,
  args: {
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
  },
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
```
This example illustrates how complex data structures managed by Storybook controls can be seamlessly passed to and rendered by your TYPO3 Fluid templates.
```

### Using Complex `argTypes` (Objects and Arrays)

Storybook's `argTypes` allow for detailed configuration of controls, including those for complex data types like objects and arrays. These can be effectively used with `FluidTemplate` to pass structured data to your Fluid components.

Below is an example demonstrating how to configure `argTypes` for object and array inputs and pass them to `FluidTemplate`, now using TypeScript.

**Example Storybook Story (TypeScript):**

```typescript
// In your .stories.ts file
import type { Meta, StoryObj } from '@storybook/html';
// import FluidTemplate from 'typo3fluid2storybook-addon'; // Or your import path

interface UserData {
  name: string;
  roles: string[];
  id: number;
  isActive: boolean;
  address: { street: string; city: string };
}

interface Item {
  title: string;
  value: string;
  data: { count: number; priority?: string };
}

interface ComplexComponentArgs {
  templatePath: string;
  userData: UserData;
  items: Item[];
  pageTitle: string;
}

const metaComplex: Meta<ComplexComponentArgs> = {
  title: 'Components/ComplexFluidComponent',
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    templatePath: {
      control: 'text',
    },
    userData: {
      control: 'object',
    },
    items: {
      control: 'array',
    },
    pageTitle: {
        control: 'text',
    }
  },
  args: { // Default values for the args
    templatePath: 'EXT:my_ext/Resources/Private/Templates/ComplexComponent.html',
    userData: {
      name: 'Jane Doe',
      roles: ['Editor', 'Reviewer'],
      id: 123,
      isActive: true,
      address: { street: '123 Main St', city: 'Storybook City' }
    },
    items: [
      { title: 'First Item', value: 'val1', data: { count: 10 } },
      { title: 'Second Item', value: 'val2', data: { count: 25 } },
      { title: 'Third Item', value: 'val3', data: { count: 5 } },
    ],
    pageTitle: 'My Complex Component View'
  }
};
export default metaComplex;

type ComplexStory = StoryObj<ComplexComponentArgs>;

const ComplexTemplate: ComplexStory['render'] = (args: ComplexComponentArgs) => {
  const { templatePath, userData, items, pageTitle, ...otherStorybookArgs } = args;

  // console.log("Other Storybook Args not passed to Fluid:", otherStorybookArgs);

  const fluidVariables = {
    user: userData,
    itemList: items,
    title: pageTitle,
  };

  const htmlOutput = FluidTemplate({ // FluidTemplate is the function from this package
    templatePath: templatePath,
    variables: fluidVariables,
  });

  const container = document.createElement('div');
  container.className = 'story-wrapper';
  container.innerHTML = htmlOutput;
  return container; // Or return htmlOutput string directly
};

export const Default: ComplexStory = {
  render: ComplexTemplate,
};

export const AdminUser: ComplexStory = {
  render: ComplexTemplate,
  args: {
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
  },
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
```
This example illustrates how complex data structures managed by Storybook controls can be seamlessly passed to and rendered by your TYPO3 Fluid templates.
```

### Using Complex `argTypes` (Objects and Arrays)

Storybook's `argTypes` allow for detailed configuration of controls, including those for complex data types like objects and arrays. These can be effectively used with `FluidTemplate` to pass structured data to your Fluid components.

Below is an example demonstrating how to configure `argTypes` for object and array inputs and pass them to `FluidTemplate`, now using TypeScript.

**Example Storybook Story (TypeScript):**

```typescript
// In your .stories.ts file
import type { Meta, StoryObj } from '@storybook/html';
// import FluidTemplate from 'typo3fluid2storybook-addon'; // Or your import path

interface UserData {
  name: string;
  roles: string[];
  id: number;
  isActive: boolean;
  address: { street: string; city: string };
}

interface Item {
  title: string;
  value: string;
  data: { count: number; priority?: string };
}

interface ComplexComponentArgs {
  templatePath: string;
  userData: UserData;
  items: Item[];
  pageTitle: string;
}

const metaComplex: Meta<ComplexComponentArgs> = {
  title: 'Components/ComplexFluidComponent',
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    templatePath: {
      control: 'text',
    },
    userData: {
      control: 'object',
    },
    items: {
      control: 'array',
    },
    pageTitle: {
        control: 'text',
    }
  },
  args: { // Default values for the args
    templatePath: 'EXT:my_ext/Resources/Private/Templates/ComplexComponent.html',
    userData: {
      name: 'Jane Doe',
      roles: ['Editor', 'Reviewer'],
      id: 123,
      isActive: true,
      address: { street: '123 Main St', city: 'Storybook City' }
    },
    items: [
      { title: 'First Item', value: 'val1', data: { count: 10 } },
      { title: 'Second Item', value: 'val2', data: { count: 25 } },
      { title: 'Third Item', value: 'val3', data: { count: 5 } },
    ],
    pageTitle: 'My Complex Component View'
  }
};
export default metaComplex;

type ComplexStory = StoryObj<ComplexComponentArgs>;

const ComplexTemplate: ComplexStory['render'] = (args: ComplexComponentArgs) => {
  const { templatePath, userData, items, pageTitle, ...otherStorybookArgs } = args;

  // console.log("Other Storybook Args not passed to Fluid:", otherStorybookArgs);

  const fluidVariables = {
    user: userData,
    itemList: items,
    title: pageTitle,
  };

  const htmlOutput = FluidTemplate({ // FluidTemplate is the function from this package
    templatePath: templatePath,
    variables: fluidVariables,
  });

  const container = document.createElement('div');
  container.className = 'story-wrapper';
  container.innerHTML = htmlOutput;
  return container; // Or return htmlOutput string directly
};

export const Default: ComplexStory = {
  render: ComplexTemplate,
};

export const AdminUser: ComplexStory = {
  render: ComplexTemplate,
  args: {
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
  },
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
```
This example illustrates how complex data structures managed by Storybook controls can be seamlessly passed to and rendered by your TYPO3 Fluid templates.
```

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

**Example Storybook Story (`.stories.ts`):**

```typescript
// Example: src/stories/FluidTemplateViewer.stories.ts
import type { Meta, StoryObj } from '@storybook/html';

// Adjust the path to where you copied FluidTemplate.js or from package
// import FluidTemplate from 'typo3fluid2storybook-addon';
import FluidTemplate from '../../.storybook/typo3FluidTemplates'; // Example if copied

// Adjust the path to your generated JSON file
import templatePathsByName from '../../.storybook/fluid-templates.json';

interface Author {
  name: string;
  email: string;
  role: string;
}

interface ViewerArgs {
  selectedTemplate: string; // This will hold the EXT:path after mapping
  headline?: string;
  text?: string;
  author?: Author;
  // Add other common variables your templates might use
}

const metaViewer: Meta<ViewerArgs> = {
  title: 'TYPO3 Fluid Viewer',
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    selectedTemplate: {
      name: 'Select Fluid Template',
      description: 'Choose a Fluid template to render. The paths are sourced from the generated JSON file.',
      control: 'select',
      options: Object.keys(templatePathsByName),
      mapping: templatePathsByName,
    },
    headline: {
      name: 'Headline Text',
      control: 'text',
      description: 'A headline variable often used in templates.',
    },
    text: {
      name: 'Body Text',
      control: 'text',
    },
    author: {
      name: 'Author Data (Object)',
      control: 'object',
    }
  },
  args: { // Default values for this meta
    headline: 'Welcome to Fluid in Storybook!',
    text: 'This is some sample text passed as a variable to the Fluid template.',
    author: {
      name: 'Max Mustermann',
      email: 'max.mustermann@example.com',
      role: 'Content Editor'
    }
  }
};
export default metaViewer;

type ViewerStory = StoryObj<ViewerArgs>;

const ViewerTemplate: ViewerStory['render'] = (args: ViewerArgs) => {
  const { selectedTemplate, ...fluidVariables } = args;

  if (!selectedTemplate || Object.keys(templatePathsByName).length === 0) {
    // Handle no selection or empty template map
    // (Same as previous JavaScript example)
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

  const htmlOutput = FluidTemplate({ // FluidTemplate is the function from this package
    templatePath: selectedTemplate,
    variables: fluidVariables,
  });

  const container = document.createElement('div');
  container.className = 'fluid-story-render';
  container.innerHTML = htmlOutput;
  return container; // Or return htmlOutput string directly
};

export const Viewer: ViewerStory = {
  render: ViewerTemplate,
  args: {
    selectedTemplate: Object.keys(templatePathsByName).length > 0
                      ? Object.keys(templatePathsByName)[0] // Default to first alias
                      : undefined,
    // Other args will use defaults from metaViewer.args
  },
  parameters: {
    notes: Object.keys(templatePathsByName).length > 0
           ? `This story uses a dynamic list of Fluid templates from \`fluid-templates.json\`.
              If you add or remove templates, re-run the discovery script.`
           : 'No templates found. Run discovery script.'
  }
};
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

## Using Dynamic Data from TYPO3 (with Storybook Loaders)

To create more realistic previews, you often need to fetch dynamic data from your TYPO3 backend (or any other API) and pass it to your Fluid templates. Storybook `loaders` are asynchronous functions that fetch data before a story renders, making this possible.

### Overview of Storybook Loaders

*   **Asynchronous Data Fetching:** Loaders run before the story's `render` function. They can fetch data from any API.
*   **`loaded` Data:** The data returned by loaders is passed to the `render` function via the `loaded` property in its second argument (`{ loaded }`).
*   **Environment Variables:** It's good practice to use environment variables for API base URLs.

### Environment Variable for Data API

1.  Create or update your `.env` file in your Storybook project root:
    ```env
    STORYBOOK_TYPO3_DATA_API_BASE_URL=https://your-typo3-site.com/api/data
    # For Vite-based Storybook, you might need to prefix with VITE_
    # VITE_TYPO3_DATA_API_BASE_URL=https://your-typo3-site.com/api/data
    ```
    (Check your Storybook's environment variable handling; `STORYBOOK_` is common, but Vite projects often use `VITE_` for variables to be exposed to client-side code via `import.meta.env` or `process.env` after transformation). For this example, we'll assume `process.env.STORYBOOK_TYPO3_DATA_API_BASE_URL`.

2.  Access in loader: `const baseUrl = process.env.STORYBOOK_TYPO3_DATA_API_BASE_URL;`

### Detailed Story Example with Loaders

This example demonstrates fetching data for a specific content element from a TYPO3 API and rendering it with `FluidTemplate`.

```typescript
// src/stories/DynamicContentElement.stories.ts
import type { Meta, StoryObj, StoryContext } from '@storybook/html';
// Assuming FluidTemplate is imported, e.g., from the package or a local copy
import FluidTemplate from 'typo3fluid2storybook-addon';

interface ContentElementData {
  // Define the expected structure of your content element data
  uid: number;
  header?: string;
  bodytext?: string;
  // ... other fields
}

interface DynamicContentArgs {
  contentElementUid: number;
  templatePath: string;
  // Other static args for the story can be added here
}

// Type for the data returned by the loader
interface LoadedData {
  contentElementData?: ContentElementData;
  error?: Error;
}

const meta: Meta<DynamicContentArgs> = {
  title: 'TYPO3/Dynamic Content Element',
  argTypes: {
    contentElementUid: { control: 'number', defaultValue: 1 },
    templatePath: {
      control: 'text',
      defaultValue: 'EXT:my_extension/Resources/Private/Templates/ContentElements/Text.html'
    },
  },
  loaders: [
    async (context: StoryContext<DynamicContentArgs>): Promise<LoadedData> => {
      const { args } = context;
      const { contentElementUid } = args; // Get UID from story args

      // Ensure your Storybook setup correctly loads and provides this env var.
      // For Vite, it might be import.meta.env.VITE_TYPO3_DATA_API_BASE_URL
      const apiBaseUrl = process.env.STORYBOOK_TYPO3_DATA_API_BASE_URL || '/api/data'; // Fallback for safety

      if (!contentElementUid) {
        return { error: new Error('Content Element UID is not provided.') };
      }

      try {
        const response = await fetch(`${apiBaseUrl}/content_element/${contentElementUid}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch content element data: ${response.status} ${response.statusText}`);
        }
        const data: ContentElementData = await response.json();
        return { contentElementData: data };
      } catch (error: any) {
        console.error('Loader error fetching content element:', error);
        return { error: error instanceof Error ? error : new Error('Unknown loader error') };
      }
    },
  ],
  render: (args, { loaded }: { loaded: LoadedData }) => {
    const { templatePath, ...storyArgs } = args; // storyArgs contains contentElementUid

    // Handle loading state (if data is not yet available and no error was thrown/returned by loader)
    // Note: Storybook typically awaits loaders, so you might not see this state unless data fetching is slow
    // or if you return partial data progressively (more advanced).
    if (loaded === undefined && !loaded?.error) { // loaded can be undefined if loader is still running or failed early
      return '<div>Loading content element data...</div>';
    }

    // Handle error state from loader
    if (loaded.error) {
      return `<div style="color: red; border: 1px solid red; padding: 10px;">
                <strong>Error loading data:</strong> ${loaded.error.message}
              </div>`;
    }

    // Data is loaded, render the template
    if (loaded.contentElementData) {
      return FluidTemplate({
        templatePath: templatePath,
        variables: {
          // Structure variables as your Fluid template expects them
          data: loaded.contentElementData, // e.g., pass the whole data object
          settings: storyArgs, // Pass other story args if needed by the template
          // Example: headline: loaded.contentElementData.header (if you want to map specific fields)
        },
      });
    }

    return '<div>No content element data loaded, or an unknown issue occurred.</div>';
  },
};
export default meta;

type Story = StoryObj<DynamicContentArgs>;

export const TextElement: Story = {
  args: {
    contentElementUid: 1, // Example UID for a text element
    templatePath: 'EXT:my_site_package/Resources/Private/Templates/ContentElements/Text.html',
  },
};

export const TextMediaElement: Story = {
  args: {
    contentElementUid: 2, // Example UID for a textmedia element
    templatePath: 'EXT:my_site_package/Resources/Private/Templates/ContentElements/TextMedia.html',
  },
};

export const NonExistentElement: Story = {
    args: {
        contentElementUid: 9999, // An ID that likely doesn't exist
        templatePath: 'EXT:my_site_package/Resources/Private/Templates/ContentElements/Text.html',
    }
}
```

### Guidance on TYPO3 Data API

To support the Storybook loader example above, you would need to implement an API endpoint in your TYPO3 installation.

*   **Functionality:**
    *   The endpoint (e.g., `/api/data/content_element/{uid}`) should accept an identifier (like a content element UID).
    *   It should fetch the corresponding data from your TYPO3 database (e.g., using TYPO3's QueryBuilder, Repositories, or custom queries).
    *   It should then format this data into a JSON structure that your Fluid template expects as variables.
    *   Return the JSON response.
*   **Example (Conceptual TYPO3 Controller Action):**
    ```php
    // In a TYPO3 Controller (e.g., an Extbase ActionController or PSR-15 Middleware)
    public function getContentElementAction(int $uid): ResponseInterface
    {
        // 1. Fetch data for content element with $uid
        // $contentElement = $this->myContentRepository->findByUid($uid);
        // 2. Process/transform data into an array/DTO as needed for the Fluid template
        // $dataForFluid = [
        //     'uid' => $contentElement->getUid(),
        //     'header' => $contentElement->getHeader(),
        //     'bodytext' => $contentElement->getBodytext(),
        //     // ... other fields ...
        // ];
        // 3. Return as JSON response
        // return $this->jsonResponse(json_encode($dataForFluid));

        // Placeholder:
        $dataForFluid = ['uid' => $uid, 'header' => 'Dynamic Header for UID ' . $uid, 'bodytext' => 'This is dynamic content.'];
        if ($uid === 9999) { // Simulate not found
            return new JsonResponse(['error' => 'Content element not found'], 404);
        }
        return new JsonResponse($dataForFluid);
    }
    ```
*   **Important:** The structure of the JSON data returned by your API should directly map to the variables your Fluid template (e.g., `ContentElement.html`) is designed to work with. Implementing this TYPO3 data API is your responsibility and is outside the scope of this Storybook integration tool itself.

Using loaders enables you to build highly representative previews of your TYPO3 content elements and pages directly in Storybook.

---

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---

## License

This package is licensed under the MIT License.

---

## Credits

Developed by Casian Blanaru. Inspired by TYPO3 and Storybook integration workflows.
