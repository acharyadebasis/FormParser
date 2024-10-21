const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
    formName: {
        type: String,
        required: true,
        unique: true,
    },
    formSchema: {
        type: mongoose.Schema.Types.Mixed, // Change to Mixed for flexible JSON
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const FormDataModel = new mongoose.Schema({
    formId: {
        type: String,
        required: true,
    },
    formName: {
        type: String,
        required: true,
    },
    formData: {
        type: mongoose.Schema.Types.Mixed, // Change to Mixed for flexible JSON
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Form = mongoose.model('forms', FormSchema);
const FormData = mongoose.model('formdata', FormDataModel);

module.exports = { Form, FormData };
