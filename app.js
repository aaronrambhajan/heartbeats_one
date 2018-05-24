const express = require('express');
const app = express();
const mongoose = require('mongoose');
const body_parser = require('body-parser');
const trialData = require('./models/trialData');

//mongoose.connect('mongodb://localhost/jspsych');
mongoose.connect(process.env.CONNECTION);
let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
    console.log('Database opened');
});

app.use(body_parser.json());
app.use(express.static(__dirname + '/public'));
app.use('/jsPsych', express.static(__dirname + "/jsPsych"));

app.set('views', __dirname + "/public");
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', function(req, res) {
    res.render('index.html');
});

app.get('/experiment', function(req, res) {
     res.render('audio_test.html');
});

app.post('/experiment-data', function(req, res) {
    trialData.create({
        'subject': req.body[0].subject,
        'trial': req.body[0].trial_index,
        'stimulus': req.body[0].stimulus,
        'rt': req.body[0].rt,
        'r': req.body[0].key_press,
        'correct': req.body[0].correct,
        'timestamp': req.body[0].date
    });
    res.end();
});

const server = app.listen(process.env.PORT, function() {
    console.log("Listening on port %d", server.address().port);
});

