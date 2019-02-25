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

app.get('/Contact', (req, res) => {
	res.render('contact');
});

app.get('/Developers', (req, res) => {
	res.render('developers');
});

app.get('/TOS', (req, res) => {
	res.render('tos');
});

app.get('/Privacy', (req, res) => {
	res.render('privacy');
});

app.get('/Login', (req, res) => {
	res.render('login');
});

app.get('/signUp', (req, res) => {
	res.render('signUp');
});

app.get('/Dashboard', (req, res) => {
	if (req.query.uid) {
		db.collection('users')
			.doc(req.query.uid)
			.get()
			.then(doc => {
				if (doc.exists) {
					if (doc.data().role === 'player')
						return res.redirect('/dashPlayer');
					else if (doc.data().role === 'sponsor')
						return res.redirect('/dashSponsor');
					else if (doc.data().role === 'manager')
						return res.redirect('/dashManager');
					else if (doc.data().role === 'sponsor_manager')
						return res.redirect('/dashSponsor_Manager');
					else return res.redirect('/login');
				} else return res.redirect('/signUp');
			})
			.catch(err => {
				return res.send(err);
			});
	} else res.redirect('/login');
});

app.get('/onLogin', (req, res) => {
	if (req.query.uid) {
		db.collection('users')
			.doc(req.query.uid)
			.get()
			.then(doc => {
				if (doc.exists) {
					return res.redirect('/dashboard/?uid=' + doc.data().uid);
				} else return res.redirect('/signUp?uid=' + doc.data().uid);
			})
			.catch(err => {
				return res.send(err);
			});
	} else res.redirect('/login');
});

app.get('/dashPlayer', (req, res) => {
	if (req.query.uid) {
		db.collection('users')
			.doc(req.query.uid)
			.get()
			.then(doc => {
				if (doc.exists) {
					return res.render('dashPlayer');
				} else return res.redirect('/signUp?uid=' + doc.data().uid);
			})
			.catch(err => {
				return res.send(err);
			});
	} else res.redirect('/login');
});

app.get('/dashSponsor', (req, res) => {
	res.render('dashSponsor');
});

app.get('/dashManager', (req, res) => {
	res.render('dashManager');
});

app.get('/dashSponsor_Manager', (req, res) => {
	res.render('dashSponsor_Manager');
});

app.post('/onSignUp', (req, res) => {
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var emailId = req.body.emailId;
	var password = req.body.password;
	var mobile = req.body.mobile;
	var role = req.body.userRole;
	var uid = req.body.uid;
	db.collection('users')
		.doc(uid)
		.set({
			firstName: firstName,
			lastName: lastName,
			emailId: emailId,
			mobile: mobile,
			password: password,
			role: role
		})
		.catch(err => {
			return res.send(err);
		});
	res.redirect('/Dashboard?uid=' + uid);
});

app.get('/fetchUser', (req, res) => {
	db.collection('users')
		.doc(req.query.uid)
		.get()
		.then(doc => {
			if (doc.exists) {
				return res.send(doc.data());
			} else return res.send("UID doesn't exist");
		})
		.catch(err => {
			return res.send(err);
		});
});

app.use((req, res, next) => {
	res.status(404).render('404');
});

exports.app = functions.https.onRequest(app);
