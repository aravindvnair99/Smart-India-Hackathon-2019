const functions = require('firebase-functions'),
    express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.set('views', './views');
app.set('view engine', 'ejs');

var db = admin.firestore();

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signUp', (req, res) => {
    res.render('signUp');
});

app.get('/homePage', (req, res) => {
    res.render('homePage');
});

app.get('/onSignUp', (req, res) => {

})

app.use((req, res, next) => {
    res.status(404).render('404');
});

exports.app = functions.https.onRequest(app);


