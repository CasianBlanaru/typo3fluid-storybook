
# TYPO3Fluid-Storybook-JS-Integration

Render TYPO3 Fluid templates inside Storybook.

This package provides a way to integrate TYPO3 Fluid templates into Storybook, enabling frontend developers to work seamlessly with TYPO3 Fluid components in a modern development environment.

---

## Features

- Render TYPO3 Fluid templates directly in Storybook.
- Support for TYPO3 v12.
- Simplified integration for TYPO3-driven projects.
- Build modern, component-based frontend designs while staying connected to TYPO3.

---

## Usage Example

This example demonstrates how to integrate a TYPO3 Fluid template (`PersonsListTeaserFluid`) into Storybook for rendering and interactive customization.

### Fluid Template Import

The Fluid renderer is imported using the `FluidTemplate` function:

```javascript
import FluidTemplate from '../../../../.storybook/typo3FluidTemplates';
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
```

---

## Benefits

- **Interactive Testing**: Test Fluid templates dynamically in Storybook.
- **Decoupled Development**: Render TYPO3 Fluid templates without a fully loaded TYPO3 environment.
- **Modern Workflow**: Enable modern component-based frontend development.

---

## Requirements

- TYPO3 Fluid API (e.g., `/fluid/render` endpoint).
- `FluidTemplate` function available in the project.

---

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

---

## License

This package is licensed under the MIT License.

---

## Credits

Developed by Casian Blanaru. Inspired by TYPO3 and Storybook integration workflows.
