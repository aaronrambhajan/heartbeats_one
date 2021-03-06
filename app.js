const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const body_parser = require('body-parser');
const trial = require('./models/trials.js');
const user = require('./models/user.js');
const DB = require('./models/db.js');

DB.connect(true); // true if in production
app.use(body_parser.json());
app.use(express.static(__dirname + '/public'));
app.use('/jsPsych', express.static(__dirname + "/jsPsych"));
app.set('views', __dirname + "/public");
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(session({
    saveUninitialized: true, 
    resave: true, 
    secret: 'secret',
    store: new MongoStore({ 
        url: DB.getURL(),
        autoReconnect: true,
        collection: 'sessions'
    })
}));

app.get('/', function(req, res) {
    res.render('index.html');
});

app.get('/consent', function(req, res) {
    res.render('consent.html');
});

app.get('/experiment', function(req, res) {
     res.render('audio_test.html');
});

app.get('/results', function(req, res) {
/*    
    trial.aggregate( [ 

        { $project: 
            { _id: 0, subject: 1, correct: '$correct', trial: 1, email: 1 } 
        },

        { $group:
            { _id: '$subject' }
        },

        { $match: 
            { correct: true }  
        },
 
     ],             
     function(err, data) {
        res.send(data);
     });
*/ 

     trial.find({}, function(err, data) {
        res.send(data);
     });
});

app.post('/user-data', function(req, res) {
    req.session.email = req.body.user;
    res.end();
});

app.post('/experiment-data', function(req, res) {
    trial.create({
        'subject': req.body[0].subject,
        'email': req.session.email,
        'trial': req.body[0].trial_index,
        'stimulus': req.body[0].stimulus,
        'rt': req.body[0].rt,
        'r': req.body[0].key_press,
        'correct': req.body[0].correct,
        'timestamp': req.body[0].date
    });
    res.end();
});

const server = app.listen(DB.getPort(), function() {
    console.log("Listening on port %d", server.address().port);
});
