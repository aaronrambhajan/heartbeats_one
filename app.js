const express = require('express');
const app = express();
const mongoose = require('mongoose');
const body_parser = require('body-parser');

const trial = require('./models/trials.js');
const user = require('./models/user.js');
const DB = require('./models/db.js');

let sessionName;
DB.connect(true); // true if in production
/* 
mongoose.connect('mongodb://localhost/jspsych');
//mongoose.connect(process.env.CONNECTION);
let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
    console.log('Database opened');
});
*/

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
    trial.create({
        'subject': req.body[0].subject,
        'email': sessionName,
        'trial': req.body[0].trial_index,
        'stimulus': req.body[0].stimulus,
        'rt': req.body[0].rt,
        'r': req.body[0].key_press,
        'correct': req.body[0].correct,
        'timestamp': req.body[0].date
    });
    res.end();
});

app.post('/user-data', function(req, res) {
    sessionName = req.body.user;
    res.end();
});

app.post('/admin-registration', function(req, res) {
    let userData = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        passwordConf: req.body.passwordConf
    };
    user.create(userData, function(err, user) {
        if (err) {
            return next(err);
        } else {
            return res.redirect('/'); // '/profile'
        }
    });
});

const server = app.listen(DB.getPort(), function() {
    console.log("Listening on port %d", server.address().port);
});

