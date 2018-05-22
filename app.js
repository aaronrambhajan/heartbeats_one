const express = require('express');
const app = express();
const mongoose = require('mongoose');
const body_parser = require('body-parser');
// const ts = require('./trials.js');

// Define database
let schema = new mongoose.Schema({}, { strict: false});
let Entry = mongoose.model('Entry', schema);

// mongoose.connect('mongodb://localhost/jspsych');
mongoose.connect(process.env.CONNECTION);
let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
    console.log('database opened');
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
     // {learning: {}, testing: {}}
     // const timeline = ts('./public/sound/regular', './public/sound/irregular');
     res.render('audio_test.html');
});

app.post('/experiment-data', function(req, res) {
    Entry.create({
        'data': req.body
    });    
    res.end();
});

// process.env.PORT
const server = app.listen(3000, function() {
    console.log("Listening on port %d", server.address().port);
});

