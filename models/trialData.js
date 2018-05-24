const mongoose = require('mongoose');

let dataSchema = new mongoose.Schema({
    subject: String,
    trial: Number,
    stimulus: String,
    rt: Number,
    r: Number,
    correct: Boolean,
    timestamp: Date
});

const trialData = mongoose.model('trialData', dataSchema);
module.exports = trialData;
