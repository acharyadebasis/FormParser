const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const connectToMongo = require('./formservice'); 
const { Form } = require('./form.model');
const cors = require('cors');
const app = express();


app.use(cors());

const port = 5001;
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.static('public'));

connectToMongo();

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
    // const isRequired = attributes.required === "" || attributes.required === true;

    return {
        type: 'radio',
        label: legend,
        values: radios,
        // validate: {
        //     required: isRequired 
        // }
    };
}

// Function to process select elements
function processSelect(element) {
    const spanLabel = element.nextElementSibling && element.nextElementSibling.tagName.toLowerCase() === 'span'
        ? element.nextElementSibling.textContent.trim()
        : '';

    const options = Array.from(element.querySelectorAll('option')).map(option => ({
        label: option.textContent.trim(),
        value: option.value || option.textContent.trim().replace(/\s+/g, '').toLowerCase()
    }));

    const attributes = Array.from(element.attributes).reduce((attrs, attr) => {
        attrs[attr.name] = attr.value;
        return attrs;
    }, {});
    const isRequired = attributes.required === "" || attributes.required === true;

    return {
        type: 'select',
        label: spanLabel,
        data: {
            values: options
        },
        attributes: attributes,
        validate: {
            required: isRequired 
        }
    };
}

// Function to process headers and paragraphs
function processTextElement(element) {
    return {
        html: element.outerHTML,
        label: "Content", // You can customize this label as needed
        customClass: "",
        refreshOnChange: false,
        hidden: false,
        modalEdit: false,
        key: "content", // Consider generating unique keys if there are multiple headers
        tags: [],
        conditional: {
            show: null,
            when: null,
            eq: "",
            json: ""
        },
        customConditional: "",
        logic: [],
        overlay: {
            style: "",
            page: "",
            left: "",
            top: "",
            width: "",
            height: ""
        },
        type: "content",
        dataGridLabel: false,
        input: false,
        placeholder: "",
        prefix: "",
        suffix: "",
        multiple: false,
        defaultValue: null,
        protected: false,
        unique: false,
        persistent: true,
        clearOnHide: true,
        refreshOn: "",
        redrawOn: "",
        tableView: false,
        labelPosition: "top",
        description: "",
        errorLabel: "",
        tooltip: "",
        hideLabel: false,
        tabindex: "",
        disabled: false,
        autofocus: false,
        dbIndex: false,
        customDefaultValue: "",
        calculateValue: "",
        calculateServer: false,
        widget: null,
        validateOn: "change",
        validate: {
            required: false,
            custom: "",
            customPrivate: false,
            strictDateValidation: false,
            multiple: false,
            unique: false
        },
        allowCalculateOverride: false,
        encrypted: false,
        showCharCount: false,
        showWordCount: false,
        allowMultipleMasks: false,
        addons: [],
        id: "unique-id", // Consider generating unique IDs
        attributes: {},
        properties: {}
    };
}

function processButton(element) {
    return {
        type: 'button',
        label: element.textContent.trim() || 'Submit', // Get button label
        key: 'submit', // Set a default key
        size: 'md', // Default size
        block: false, // Default block value
        action: element.getAttribute('type') || 'submit', // Use type for action
        disableOnInvalid: true, // Default behavior
        theme: 'primary', // Default theme
        id: generateUniqueId(), // Function to generate a unique ID
        input: true, // Set input to true
        placeholder: '', // Default placeholder
        prefix: '', // Default prefix
        customClass: '', // Default custom class
        suffix: '', // Default suffix
        multiple: false, // Default multiple
        defaultValue: null, // Default value
        protected: false, // Default protected
        unique: false, // Default unique
        persistent: false, // Default persistent
        hidden: false, // Default hidden
        clearOnHide: true, // Default clearOnHide
        refreshOn: '', // Default refreshOn
        redrawOn: '', // Default redrawOn
        tableView: false, // Default tableView
        modalEdit: false, // Default modalEdit
        dataGridLabel: true, // Default dataGridLabel
        labelPosition: 'top', // Default label position
        description: '', // Default description
        errorLabel: '', // Default error label
        tooltip: '', // Default tooltip
        hideLabel: false, // Default hideLabel
        tabindex: '', // Default tabindex
        disabled: false, // Default disabled
        autofocus: false, // Default autofocus
        dbIndex: false, // Default dbIndex
        customDefaultValue: '', // Default custom default value
        calculateValue: '', // Default calculate value
        calculateServer: false, // Default calculate server
        widget: {
            type: 'input' // Default widget type
        },
        validateOn: 'change', // Default validateOn
        validate: {
            required: false, // Default required
            custom: '', // Default custom validation
            customPrivate: false, // Default customPrivate
            strictDateValidation: false, // Default strictDateValidation
            multiple: false, // Default multiple
            unique: false // Default unique
        },
        conditional: {
            show: null, // Default conditional show
            when: null, // Default conditional when
            eq: '' // Default conditional eq
        },
        overlay: {
            style: '', // Default overlay style
            left: '', // Default overlay left
            top: '', // Default overlay top
            width: '', // Default overlay width
            height: '' // Default overlay height
        },
        allowCalculateOverride: false, // Default allowCalculateOverride
        encrypted: false, // Default encrypted
        showCharCount: false, // Default showCharCount
        showWordCount: false, // Default showWordCount
        allowMultipleMasks: false, // Default allowMultipleMasks
        addons: [], // Default addons
        leftIcon: '', // Default leftIcon
        rightIcon: '', // Default rightIcon
        attributes: {}, // Default attributes
        properties: {} // Default properties
    };
}

// Unique ID generator
function generateUniqueId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}


// Function to process input fields
function processInput(element) {
    const spanLabel = element.nextElementSibling && element.nextElementSibling.tagName.toLowerCase() === 'span'
        ? element.nextElementSibling.textContent.trim()
        : '';

    const attributes = Array.from(element.attributes).reduce((attrs, attr) => {
        attrs[attr.name] = attr.value;
        return attrs;
    }, {});

    const isRequired = attributes.required === "" || attributes.required === true;

    if (attributes.type === 'hidden') {
        return {
            hidden: true,
            attributes: attributes
        };
    } else if (attributes.type === 'checkbox') {
        return {
            type: 'checkbox',
            label: spanLabel,
            attributes: attributes,
            validate: {
                required: isRequired 
            }
        };
    } else if (attributes.type === 'button' || attributes.type === 'submit') {
        return {
            type: 'button',
            label: spanLabel,
            attributes: attributes,
            // You might not want validation for buttons
        };
    } else {
        return {
            type: element.tagName.toLowerCase(),
            label: spanLabel,
            attributes: {
                ...attributes,
            },
            validate: {
                required: isRequired 
            }
        };
    }
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

                    // Process headers and paragraphs
                    if (['h1', 'h2', 'h3', 'p'].includes(tag)) {
                        const textOutput = processTextElement(element);
                        output.components.push(textOutput);
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
                    else if (tag === 'input' && element.type !== 'radio')  {
                        const inputOutput = processInput(element);
                        output.components.push(inputOutput);
                    }
                   
                    // Inside your main processing loop
                    if (tag === 'button') {
                        const buttonOutput = processButton(element);
                        output.components.push(buttonOutput);
                    }
                });

                // Save the output for the current file
                const jsonFilePath = path.join(outputDir, `${path.basename(file.originalname, path.extname(file.originalname))}.json`);
                fs.writeFileSync(jsonFilePath, JSON.stringify(output, null, 2));

                const form = new Form({
                    formName: path.basename(file.originalname, path.extname(file.originalname)),
                    formSchema: output, 
                });

                await form.save();

                // Clean up the uploaded file
                fs.unlinkSync(file.path);
            }
        }

        res.send('Files processed successfully!');
    } catch (error) {
        console.error('Error processing files:', error);
        res.status(500).send('An error occurred while processing the files.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
