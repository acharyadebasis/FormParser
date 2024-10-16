const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const port = 5000;
const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.static('public'));

// Ensure the json_output directory exists
const outputDir = 'json_output';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Function to process fieldsets
function processFieldset(element) {
    const legend = element.querySelector('legend') ? element.querySelector('legend').textContent.trim() : '';
    const radios = Array.from(element.querySelectorAll('label')).reduce((opts, label) => {
        const radioInput = label.querySelector('input[type="radio"]');
        if (radioInput) {
            opts.push({
                label: label.textContent.trim(),
                value: radioInput.value,
                attributes: Array.from(radioInput.attributes).reduce((attrs, attr) => {
                    attrs[attr.name] = attr.value;
                    return attrs;
                }, {})
            });
        }
        return opts;
    }, []);

    return {
        type: 'radio',
        label: legend,
        values: radios
    };
}

// Function to process select elements
function processSelect(element) {
    const labelElement = element.previousElementSibling;
    const label = labelElement && labelElement.tagName.toLowerCase() === 'span'
        ? labelElement.textContent.trim()
        : '';

    const options = Array.from(element.querySelectorAll('option')).map(option => ({
        label: option.textContent.trim(),
        value: option.value || option.textContent.trim().replace(/\s+/g, '').toLowerCase()
    }));

    const attributes = Array.from(element.attributes).reduce((attrs, attr) => {
        attrs[attr.name] = attr.value;
        return attrs;
    }, {});

    return {
        type: 'select',
        label: label,
        data: {
            values: options
        },
        attributes: attributes
    };
}

// Endpoint to handle file uploads
app.post('/api/upload', upload.array('files'), async (req, res) => {
    try {
        const files = req.files;
        const css = require('css'); // Ensure you have this line

        const cssRules = {};

        // Process CSS files first to extract styles
        for (let file of files) {
            if (path.extname(file.originalname) === '.css') {
                console.log('Processing file:', file.originalname);
                const cssContent = fs.readFileSync(file.path, 'utf-8');
                try {
                    const parsedCSS = css.parse(cssContent);
                    parsedCSS.stylesheet.rules.forEach(rule => {
                        if (rule.type === 'rule') {
                            const className = rule.selectors[0].replace('.', '');
                            cssRules[className] = rule.declarations.map(declaration => ({
                                property: declaration.property,
                                value: declaration.value
                            }));
                        }
                    });
                    console.log('Extracted CSS rules:', cssRules);
                } catch (error) {
                    console.error('Error parsing CSS:', error);
                }

                // Clean up the uploaded CSS file
                fs.unlinkSync(file.path);
            }
        }

        for (let file of files) {
            if (['.html', '.aspx'].includes(path.extname(file.originalname))) {
                const output = {
                    display: "form",
                    components: []
                };

                const htmlContent = fs.readFileSync(file.path, 'utf-8');
                const dom = new JSDOM(htmlContent);
                const elements = Array.from(dom.window.document.querySelectorAll('*'));

                elements.forEach(element => {
                    const tag = element.tagName.toLowerCase();

                    // Capture headers and paragraphs
                    if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'p') {
                        output.components.push({
                            type: tag,
                            label: element.textContent.trim(),
                            hidden: false,
                        });
                    }

                    // Process <select> elements
                    else if (tag === 'select') {
                        const selectOutput = processSelect(element);
                        output.components.push(selectOutput);
                    }

                    // Process radio buttons within fieldsets
                    else if (tag === 'fieldset') {
                        const fieldsetOutput = processFieldset(element);
                        output.components.push(fieldsetOutput);
                    }

                    // Process input fields
                    else if (tag === 'input') {
                        const spanLabel = element.nextElementSibling && element.nextElementSibling.tagName.toLowerCase() === 'span'
                            ? element.nextElementSibling.textContent.trim()
                            : '';
                        const attributes = Array.from(element.attributes).reduce((attrs, attr) => {
                            attrs[attr.name] = attr.value;
                            return attrs;
                        }, {});

                        if (attributes.type === 'hidden') {
                            output.components.push({
                                hidden: true,
                                attributes: attributes
                            });
                        } else {
                            output.components.push({
                                type: tag,
                                label: spanLabel,
                                attributes: attributes
                            });
                        }
                    }
                });

                // Save the output for the current file
                const jsonFilePath = path.join(outputDir, `${path.basename(file.originalname, path.extname(file.originalname))}.json`);
                fs.writeFileSync(jsonFilePath, JSON.stringify(output, null, 2));

                // Clean up the uploaded file
                fs.unlinkSync(file.path);
            }
        }

        res.send('Files processed successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while processing the files.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
