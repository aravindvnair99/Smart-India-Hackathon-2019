const functions = require('firebase-functions'),
	express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
app.use(cookieParser());

app.set('views', './views');
app.set('view engine', 'ejs');

var db = admin.firestore();

app.get('/', (req, res) => {
	var i = 0,
		obj,
		eventsArray = new Array();
	db.collection('events')
		.get()
		.then(querySnapshot => {
			querySnapshot.forEach(childSnapshot => {
				eventsArray[i] = childSnapshot.id;
				i++;
			});
			events = Object.assign({}, eventsArray);
			res.render('index', { events });
			return;
		})
		.catch(err => {
			console.log(err);
		});
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

app.get('/logout', (req, res) => {
	res.clearCookie('uid');
	res.redirect('/');
});

app.get('/addEvent', (req, res) => {
	res.render('addEvent');
});

app.get('/onLogin', (req, res) => {
	if (req.cookies.uid) {
		db.collection('users')
			.doc(req.cookies.uid)
			.get()
			.then(doc => {
				if (doc.exists) {
					return res.redirect('/dashboard');
				} else return res.redirect('/signUp');
			})
			.catch(err => {
				return res.send(err);
			});
	} else res.redirect('/login');
});

app.post('/onSignUp', (req, res) => {
	var displayName = req.body.displayName;
	var email = req.body.email;
	var password = req.body.password;
	var phoneNumber = '+91' + req.body.phoneNumber;
	console.log('\n\n\n', phoneNumber);
	var role = req.body.userRole;
	function roleAdd() {
		db.collection('users')
			.doc(req.cookies.uid)
			.set({
				role: role
			})
			.then(res.redirect('/Dashboard'))
			.catch(err => {
				return res.send(err);
			});
	}
	admin
		.auth()
		.updateUser(req.cookies.uid, {
			email: email,
			phoneNumber: phoneNumber,
			password: password,
			displayName: displayName
			// photoURL: photoURL
		})
		.then(userRecord => {
			roleAdd();
			return;
		})
		.catch(error => {
			console.log('Error updating user:', error);
		});
});

app.post('/onEventAdd', (req, res) => {
	var eventName = req.body.eventName;
	var contactEmail = req.body.contactEmail;
	var contactNumber = req.body.contactNumber;
	var eventDate = req.body.eventDate;
	var eventLocation = req.body.eventLocation;
	var eventState = req.body.eventState;
	db.collection('events')
		.doc(eventName)
		.set({
			eventName: eventName,
			contactEmail: contactEmail,
			contactNumber: contactNumber,
			eventDate: eventDate,
			eventLocation: eventLocation,
			eventState: eventState
		})
		.then(res.redirect('/Dashboard'))
		.catch(err => {
			return res.send(err);
		});
});

app.get('/Dashboard', (req, res) => {
	if (req.cookies.uid) {
		db.collection('users')
			.doc(req.cookies.uid)
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

app.get('/dashPlayer', (req, res) => {
	if (req.cookies.uid) {
		db.collection('users')
			.doc(req.cookies.uid)
			.get()
			.then(doc => {
				if (doc.exists) {
					if (doc.data().role === 'dashPlayer') {
						return res.render('dashPlayer');
					} else {
						return res.redirect('/Dashboard');
					}
				} else return res.redirect('/signUp');
			})
			.catch(err => {
				return res.send(err);
			});
	} else res.redirect('/login');
});

app.get('/dashSponsor', (req, res) => {
	if (req.cookies.uid) {
		db.collection('users')
			.doc(req.cookies.uid)
			.get()
			.then(doc => {
				if (doc.exists) {
					if (doc.data().role === 'dashSponsor') {
						return res.render('dashSponsor');
					} else {
						return res.redirect('/Dashboard');
					}
				} else return res.redirect('/signUp');
			})
			.catch(err => {
				return res.send(err);
			});
	} else res.redirect('/login');
});

app.get('/dashManager', (req, res) => {
	if (req.cookies.uid) {
		db.collection('users')
			.doc(req.cookies.uid)
			.get()
			.then(doc => {
				if (doc.exists) {
					if (doc.data().role === 'dashManager') {
						return res.render('dashManager');
					} else {
						return res.redirect('/Dashboard');
					}
				} else return res.redirect('/signUp');
			})
			.catch(err => {
				return res.send(err);
			});
	} else res.redirect('/login');
});

app.get('/dashSponsor_Manager', (req, res) => {
	if (req.cookies.uid) {
		db.collection('users')
			.doc(req.cookies.uid)
			.get()
			.then(doc => {
				if (doc.exists) {
					if (doc.data().role === 'dashSponsor_Manager') {
						return res.render('dashSponsor_Manager');
					} else {
						return res.redirect('/Dashboard');
					}
				} else return res.redirect('/signUp');
			})
			.catch(err => {
				return res.send(err);
			});
	} else res.redirect('/login');
});

app.get('/fetchUser', (req, res) => {
	db.collection('users')
		.doc(req.cookies.uid)
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
