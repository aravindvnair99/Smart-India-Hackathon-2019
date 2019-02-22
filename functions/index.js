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

app.get('/TOS', (req, res) => {
    res.render('tos');
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

app.get('/onetime', (req, res) => {
    res.render('onetime');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

app.post('/onSignUp', (req, res) => {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var emailId = req.body.emailId;
    var password = req.body.password;
    var mobile = req.body.mobile;
    var role = req.body.userRole;
    var uid = req.body.uid;
    db.collection('users').doc(uid).set({
        firstName : firstName,
        lastName : lastName,
        emailId: emailId,
        mobile : mobile,
        password:password,
        role: role  
    }).catch(err =>{
        console.log(err);
    });
    res.redirect('/dashboard');
})

app.use((req, res, next) => {
    res.status(404).render('404');
});

exports.app = functions.https.onRequest(app);


