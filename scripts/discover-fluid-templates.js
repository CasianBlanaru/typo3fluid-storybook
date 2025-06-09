#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

// Function to convert a string to PascalCase or a variation for the alias (e.g., MyExt)
function toPascalCase(str) {
    return str.replace(/(?:^|[-_])(\w)/g, (_, c) => c.toUpperCase()).replace(/[-_]/g, '');
}

// Function to recursively find HTML files
function findHtmlFiles(baseDir, currentRelativeDir, results = []) {
    const currentAbsolutePath = path.join(baseDir, currentRelativeDir);
    try {
        const files = fs.readdirSync(currentAbsolutePath);
        files.forEach(file => {
            const relativeFilePath = path.join(currentRelativeDir, file);
            const absoluteFilePath = path.join(currentAbsolutePath, file);
            const stat = fs.statSync(absoluteFilePath);
            if (stat.isDirectory()) {
                findHtmlFiles(baseDir, relativeFilePath, results);
            } else if (file.endsWith('.html')) {
                results.push(relativeFilePath);
            }
        });
    } catch (error) {
        // Ignore if directory doesn't exist or is not readable
        if (error.code !== 'ENOENT' && error.code !== 'EACCES') {
            console.warn(`Warning: Could not read directory ${currentAbsolutePath}: ${error.message}`);
        }
    }
    return results;
}

// Main function
async function discoverTemplates() {
    const args = minimist(process.argv.slice(2));

    if (!args.extensions) {
        console.error('Error: --extensions argument is required. Please provide a comma-separated list of paths to your TYPO3 extension directories.');
        process.exit(1);
    }

    const extensionPaths = args.extensions.split(',');
    const outputFile = args.output || path.join('.storybook', 'fluid-templates.json');
    const absoluteOutputFile = path.resolve(outputFile);

    const fluidTemplates = {};
    let templatesFoundCount = 0;

    console.log(`Starting Fluid template discovery...`);
    console.log(`Output file will be: ${absoluteOutputFile}`);

    for (const extPath of extensionPaths) {
        const trimmedExtPath = extPath.trim();
        if (!fs.existsSync(trimmedExtPath) || !fs.statSync(trimmedExtPath).isDirectory()) {
            console.error(`Error: Extension path "${trimmedExtPath}" does not exist or is not a directory. Skipping.`);
            continue;
        }

        const absoluteExtPath = path.resolve(trimmedExtPath);
        const extensionKey = path.basename(absoluteExtPath);
        const pascalExtensionKey = toPascalCase(extensionKey);

        console.log(`\nProcessing extension: ${extensionKey} (Path: ${absoluteExtPath})`);

        const targetSubdirectories = {
            'Templates': 'Resources/Private/Templates',
            'Partials': 'Resources/Private/Partials',
            'Layouts': 'Resources/Private/Layouts',
        };

        for (const dirType in targetSubdirectories) {
            const relativeDirBasePath = targetSubdirectories[dirType]; // e.g., Resources/Private/Templates
            const absoluteDirBasePath = path.join(absoluteExtPath, relativeDirBasePath);

            if (!fs.existsSync(absoluteDirBasePath)) {
                // console.log(`  Directory type ${dirType} (${relativeDirBasePath}) not found. Skipping.`);
                continue;
            }
            // console.log(`  Scanning ${dirType} in ${relativeDirBasePath}...`);

            // Start scanning from an empty relative path within the base directory (e.g., Templates, Partials)
            const htmlFiles = findHtmlFiles(absoluteDirBasePath, '', []);

            if (htmlFiles.length > 0) {
                console.log(`  Found ${htmlFiles.length} template(s) in ${dirType}:`);
            }

            for (const relativeFilePath of htmlFiles) { // relativeFilePath is like 'Content/MyElement.html'
                const fullExtPathString = `EXT:${extensionKey}/${relativeDirBasePath}/${relativeFilePath}`.replace(/\/\//g, '/');

                const pathWithoutExtension = relativeFilePath.substring(0, relativeFilePath.length - '.html'.length);
                const aliasPathPart = pathWithoutExtension.replace(/[/\\]/g, '_'); // Replace path separators with underscores

                const alias = `${pascalExtensionKey}_${dirType}_${aliasPathPart}`;

                fluidTemplates[alias] = fullExtPathString;
                templatesFoundCount++;
                console.log(`    - ${alias}: ${fullExtPathString}`);
            }
        }
    }

    try {
        const outputDir = path.dirname(absoluteOutputFile);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            console.log(`\nCreated output directory: ${outputDir}`);
        }

        fs.writeFileSync(absoluteOutputFile, JSON.stringify(fluidTemplates, null, 2));
        console.log(`\nSuccessfully wrote ${templatesFoundCount} template entries to ${absoluteOutputFile}`);
    } catch (error) {
        console.error(`\nError writing output file ${absoluteOutputFile}: ${error.message}`);
        process.exit(1);
    }

    if (templatesFoundCount === 0) {
        console.log('\nNo Fluid templates found with the provided criteria. An empty JSON object was written.');
    }
}

discoverTemplates().catch(error => {
    console.error(`An unexpected error occurred: ${error.message}`);
    if (error.stack) {
        console.error(error.stack);
    }
    process.exit(1);
});

module.exports = { discoverTemplates, findHtmlFiles, toPascalCase }; // Export for potential testing
