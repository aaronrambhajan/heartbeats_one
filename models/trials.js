const mongoose = require('mongoose');

let dataSchema = new mongoose.Schema({
    subject: String,
    email: String,
    trial: Number,
    stimulus: String,
    rt: Number,
    r: Number,
    correct: Boolean,
    timestamp: Date
});

const trial = mongoose.model('trialData', dataSchema);
module.exports = trial;
