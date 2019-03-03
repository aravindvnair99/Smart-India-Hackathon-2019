const functions = require('firebase-functions'),
	express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

// admin.initializeApp({
// 	credential: admin.credential.cert(serviceAccount),
// 	storageBucket: "<BUCKET_NAME>.appspot.com"
// });

// var bucket = admin.storage().bucket();

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
		statesArray = new Array(),
		statesSorted = new Array(),
		sportsSorted = new Array(),
		sportsArray = new Array(),
		eventIDArray = new Array(),
		eventDetailsArray = new Array();
	db.collection('events')
		.get()
		.then(querySnapshot => {
			querySnapshot.forEach(childSnapshot => {
				eventIDArray[i] = childSnapshot.id;
				eventDetailsArray[i] = childSnapshot.data();
				statesArray[i] = childSnapshot.data().eventState;
				sportsArray[i] = childSnapshot.data().eventState;
				// var statesSorted = [];
				// statesArray.forEach(element => {
				// 	if (statesSorted.indexOf(element) < 0) {
				// 		statesSorted.push(element);
				// 	}
				// });
				// var sportsSorted = [];
				// sportsArray.forEach(element => {
				// 	if (sportsSorted.indexOf(element) < 0) {
				// 		sportsSorted.push(element);
				// 	}
				// });
				i++;
			});
			id = Object.assign({}, eventIDArray);
			events = Object.assign({}, eventDetailsArray);
			states = Object.assign({}, statesArray);
			sports = Object.assign({}, sportsArray);
			// states = Object.assign({}, statesSorted);
			// console.log('\n\n\n', states);
			// sports = Object.assign({}, sportsSorted);
			res.render('index', { id, events, states, sports });
			return;
		})
		.catch(err => {
			console.log(err);
		});
});

app.get('/Contact', (req, res) => {
	res.render('contact');
});

app.get('/FCM', (req, res) => {
	res.render('fcm');
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
	res.clearCookie('uid', { path: '/' });
	res.redirect('/');
});

app.get('/addEvent', (req, res) => {
	res.render('addEvent');
});

app.get('/onLogin', (req, res) => {
	if (req.cookies.__session) {
		db.collection('users')
			.doc(req.cookies.__session)
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
	var role = req.body.userRole;
	// function verificationUpload() {
	// 	admin.storage().ref(req.cookies.__session + '/verificationUpload/' + file.name).put(file);
	// 	res.redirect('/Dashboard');
	// }
	function roleAdd() {
		db.collection('users')
			.doc(req.cookies.__session)
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
		.updateUser(req.cookies.__session, {
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
	var eventSport = req.body.eventSport;
	db.collection('events')
		.add({
			eventName: eventName,
			contactEmail: contactEmail,
			contactNumber: contactNumber,
			eventDate: eventDate,
			eventLocation: eventLocation,
			eventState: eventState,
			eventSport: eventSport
		})
		.then(addEvent())
		.catch(err => {
			return res.send(err);
		});
	function addEvent() {
		db.collection('users')
			.doc(req.cookies.__session)
			.collection('myEvents')
			.doc(eventName)
			.set({
				eventName: eventName,
				contactEmail: contactEmail,
				contactNumber: contactNumber,
				eventDate: eventDate,
				eventLocation: eventLocation,
				eventState: eventState,
				eventSport: eventSport
			})
			.then(addSport())
			.catch(err => {
				return res.send(err);
			});
	}
	function addSport() {
		db.collection('categorizedEvents')
			.doc('sports')
			.collection(eventSport)
			.add({
				eventName: eventName,
				contactEmail: contactEmail,
				contactNumber: contactNumber,
				eventDate: eventDate,
				eventLocation: eventLocation,
				eventState: eventState,
				eventSport: eventSport
			})
			.then(addState())
			.catch(err => {
				return res.send(err);
			});
	}
	function addState() {
		db.collection('categorizedEvents')
			.doc('states')
			.collection(eventState)
			.add({
				eventName: eventName,
				contactEmail: contactEmail,
				contactNumber: contactNumber,
				eventDate: eventDate,
				eventLocation: eventLocation,
				eventState: eventState,
				eventSport: eventSport
			})
			.then(res.redirect('/Dashboard'))
			.catch(err => {
				return res.send(err);
			});
	}
});

app.get('/Dashboard', (req, res) => {
	if (req.cookies.__session) {
		db.collection('users')
			.doc(req.cookies.__session)
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
					else if (doc.data().role === 'selector')
						return res.redirect('/dashSelector');
					else return res.redirect('/login');
				} else return res.redirect('/signUp');
			})
			.catch(err => {
				return res.send(err);
			});
	} else res.redirect('/login');
});

app.get('/dashPlayer', (req, res) => {
	if (req.cookies.__session) {
		db.collection('users')
			.doc(req.cookies.__session)
			.get()
			.then(doc => {
				if (doc.exists) {
					if (doc.data().role === 'player') {
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

app.get('/dashSelector', (req, res) => {
	if (req.cookies.__session) {
		db.collection('users')
			.doc(req.cookies.__session)
			.get()
			.then(doc => {
				if (doc.exists) {
					if (doc.data().role === 'selector') {
						return res.render('dashSelector');
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
	if (req.cookies.__session) {
		db.collection('users')
			.doc(req.cookies.__session)
			.get()
			.then(doc => {
				if (doc.exists) {
					if (doc.data().role === 'sponsor') {
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
	if (req.cookies.__session) {
		db.collection('users')
			.doc(req.cookies.__session)
			.get()
			.then(doc => {
				if (doc.exists) {
					if (doc.data().role === 'manager') {
						res.render('dashManager');
						// getEvents();
						return;
					} else {
						return res.redirect('/Dashboard');
					}
				} else return res.redirect('/signUp');
			})
			.catch(err => {
				return res.send(err);
			});
	} else res.redirect('/login');
	function getEvents() {
		console.log('\n\n\n\n', 'called');
		var i = 0,
			eventIDArray = new Array(),
			eventDetailsArray = new Array();
		db.collection('users')
			.doc(req.cookies.__session)
			.collection(myEvents)
			.get()
			.then(querySnapshot => {
				querySnapshot.forEach(childSnapshot => {
					eventIDArray[i] = childSnapshot.id;
					eventDetailsArray[i] = childSnapshot.data();
					i++;
				});
				id = Object.assign({}, eventIDArray);
				events = Object.assign({}, eventDetailsArray);
				res.render('dashManager', { id, events });
				return;
			})
			.catch(err => {
				console.log(err);
			});
	}
});

app.get('/dashSponsor_Manager', (req, res) => {
	if (req.cookies.__session) {
		db.collection('users')
			.doc(req.cookies.__session)
			.get()
			.then(doc => {
				if (doc.exists) {
					if (doc.data().role === 'sponsor_Manager') {
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
		.doc(req.cookies.__session)
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
