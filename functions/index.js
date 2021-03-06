const functions = require("firebase-functions"),
	express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	cookieParser = require("cookie-parser"),
	admin = require("firebase-admin");

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	storageBucket: process.env.GCLOUD_PROJECT + ".appspot.com",
});

app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(cookieParser());
app.set("views", "./views");
app.set("view engine", "ejs");
const db = admin.firestore();

/*=============================================>>>>>

				= security functions =

===============================================>>>>>*/

function checkCookieMiddleware(req, res, next) {
	const sessionCookie = req.cookies.__session || "";
	admin
		.auth()
		.verifySessionCookie(sessionCookie, true)
		.then((decodedClaims) => {
			req.decodedClaims = decodedClaims;
			next();
			return;
		})
		.catch((error) => {
			console.log(error);
			res.redirect("/signOut");
		});
}

function setCookie(idToken, res, isNewUser) {
	const expiresIn = 60 * 60 * 24 * 5 * 1000;
	admin
		.auth()
		.createSessionCookie(idToken, {
			expiresIn,
		})
		.then(
			(sessionCookie) => {
				const options = {
					maxAge: expiresIn,
					httpOnly: true,
					secure: false, //should be true in prod
				};
				res.cookie("__session", sessionCookie, options);
				admin
					.auth()
					.verifyIdToken(idToken)
					.then((decodedClaims) => {
						console.log("\n\n\n", isNewUser);
						if (isNewUser === "true") {
							res.redirect("/dashboard");
							return console.log(decodedClaims);
						} else {
							res.redirect("/dashboard");
							return console.log(decodedClaims);
						}
					})
					.catch((error) => {
						console.log(error);
					});
				return;
			},
			(error) => {
				console.log(error);
				res.status(401).send("UNAUTHORIZED REQUEST!");
			}
		)
		.catch((error) => {
			console.log(error);
		});
}

/*=============================================>>>>>

			= basic routes =

===============================================>>>>>*/

app.get("/", (req, res) => {
	var i = 0,
		statesArray = new Array(),
		statesSorted = new Array(),
		sportsSorted = new Array(),
		sportsArray = new Array(),
		eventIDArray = new Array(),
		eventDetailsArray = new Array();
	db.collection("events")
		.get()
		.then((querySnapshot) => {
			querySnapshot.forEach((childSnapshot) => {
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
			res.render("index", { id, events, states, sports });
			return;
		})
		.catch((err) => {
			console.log(err);
		});
});

/*=============================================>>>>>

			= authentication routes =

===============================================>>>>>*/

app.get("/login", (req, res) => {
	if (req.cookies.__session) {
		res.render("dashboard");
	} else {
		res.render("login");
	}
});
app.get("/sessionLogin", (req, res) => {
	setCookie(req.query.idToken, res, req.query.isNewUser);
});
app.get("/signOut", (req, res) => {
	res.clearCookie("__session");
	res.redirect("/login");
});
app.get("/uid", checkCookieMiddleware, (req, res) => {
	res.send(req.decodedClaims.uid);
});
app.post("/onLogin", (req, res) => {
	admin
		.auth()
		.verifyIdToken(req.body.idToken, true)
		.then((decodedToken) => {
			admin
				.auth()
				.getUser(decodedToken.uid)
				.then((userRecord) => {
					console.log(
						"Successfully fetched user data:",
						userRecord.toJSON()
					);
					if (userRecord.phoneNumber && userRecord.emailVerified) {
						return res.send({
							path: "/dashboard",
						});
					} else if (!userRecord.emailVerified) {
						return res.send({
							path: "/emailVerification",
						});
					} else {
						return res.send({
							path: "/updateProfile",
						});
					}
				})
				.catch((error) => {
					console.log("Error fetching user data:", error);
					res.send("/login");
				});
			return;
		})
		.catch((error) => {
			console.log(error);
			res.send("/login");
		});
});
app.get("/emailVerification", (req, res) => {
	res.render("emailVerification");
});
app.get("/updateProfile", (req, res) => {
	res.render("updateProfile");
});
app.post("/onUpdateProfile", (req, res) => {
	admin
		.auth()
		.updateUser(req.body.uid, {
			phoneNumber: "+91" + req.body.phoneNumber,
			password: req.body.password,
			displayName: req.body.firstName + " " + req.body.lastName,
			photoURL: req.body.photoURL,
		})
		.then((userRecord) => {
			console.log("Successfully updated user", userRecord.toJSON());
			return res.redirect("/login");
		})
		.catch((error) => {
			console.log("Error updating user:", error);
		});
});

app.get("/Contact", (req, res) => {
	res.render("contact");
});

app.get("/FCM", (req, res) => {
	res.render("fcm");
});

app.get("/Developers", (req, res) => {
	res.render("developers");
});

app.get("/TOS", (req, res) => {
	res.render("tos");
});

app.get("/Privacy", (req, res) => {
	res.render("privacy");
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.get("/signUp", (req, res) => {
	res.render("signUp");
});

app.get("/logout", (req, res) => {
	res.clearCookie("uid", { path: "/" });
	res.redirect("/");
});

app.get("/addEvent", (req, res) => {
	res.render("addEvent");
});

// app.get('/onLogin', (req, res) => {
// 	if (req.cookies.__session) {
// 		db.collection('users')
// 			.doc(req.cookies.__session)
// 			.get()
// 			.then(doc => {
// 				if (doc.exists) {
// 					return res.redirect('/dashboard');
// 				} else return res.redirect('/signUp');
// 			})
// 			.catch(err => {
// 				return res.send(err);
// 			});
// 	} else res.redirect('/login');
// });

app.post("/onSignUp", (req, res) => {
	var displayName = req.body.displayName;
	var email = req.body.email;
	var password = req.body.password;
	var phoneNumber = "+91" + req.body.phoneNumber;
	var role = req.body.userRole;
	function roleAdd() {
		db.collection("users")
			.doc(req.cookies.__session)
			.set({
				role: role,
			})
			.then(res.redirect("/Dashboard"))
			.catch((err) => {
				return res.send(err);
			});
	}
	admin
		.auth()
		.updateUser(req.cookies.__session, {
			email: email,
			phoneNumber: phoneNumber,
			password: password,
			displayName: displayName,
		})
		.then((userRecord) => {
			roleAdd();
			return;
		})
		.catch((error) => {
			console.log("Error updating user:", error);
		});
});

app.post("/onEventAdd", (req, res) => {
	var eventName = req.body.eventName;
	var contactEmail = req.body.contactEmail;
	var contactNumber = req.body.contactNumber;
	var eventDate = req.body.eventDate;
	var eventLocation = req.body.eventLocation;
	var eventState = req.body.eventState;
	var eventSport = req.body.eventSport;
	db.collection("events")
		.add({
			eventName: eventName,
			contactEmail: contactEmail,
			contactNumber: contactNumber,
			eventDate: eventDate,
			eventLocation: eventLocation,
			eventState: eventState,
			eventSport: eventSport,
		})
		.then(addEvent())
		.catch((err) => {
			return res.send(err);
		});
	function addEvent() {
		db.collection("users")
			.doc(req.cookies.__session)
			.collection("myEvents")
			.doc(eventName)
			.set({
				eventName: eventName,
				contactEmail: contactEmail,
				contactNumber: contactNumber,
				eventDate: eventDate,
				eventLocation: eventLocation,
				eventState: eventState,
				eventSport: eventSport,
			})
			.then(addSport())
			.catch((err) => {
				return res.send(err);
			});
	}
	function addSport() {
		db.collection("categorizedEvents")
			.doc("sports")
			.collection(eventSport)
			.add({
				eventName: eventName,
				contactEmail: contactEmail,
				contactNumber: contactNumber,
				eventDate: eventDate,
				eventLocation: eventLocation,
				eventState: eventState,
				eventSport: eventSport,
			})
			.then(addState())
			.catch((err) => {
				return res.send(err);
			});
	}
	function addState() {
		db.collection("categorizedEvents")
			.doc("states")
			.collection(eventState)
			.add({
				eventName: eventName,
				contactEmail: contactEmail,
				contactNumber: contactNumber,
				eventDate: eventDate,
				eventLocation: eventLocation,
				eventState: eventState,
				eventSport: eventSport,
			})
			.then(res.redirect("/Dashboard"))
			.catch((err) => {
				return res.send(err);
			});
	}
});

app.get("/dashboard", (req, res) => {
	res.redirect("/");
	// if (req.cookies.__session) {
	// 	db.collection('users')
	// 		.doc(req.cookies.__session)
	// 		.get()
	// 		.then(doc => {
	// 			if (doc.exists) {
	// 				if (doc.data().role === 'player')
	// 					return res.redirect('/dashPlayer');
	// 				else if (doc.data().role === 'sponsor')
	// 					return res.redirect('/dashSponsor');
	// 				else if (doc.data().role === 'manager')
	// 					return res.redirect('/dashManager');
	// 				else if (doc.data().role === 'sponsor_manager')
	// 					return res.redirect('/dashSponsor_Manager');
	// 				else if (doc.data().role === 'selector')
	// 					return res.redirect('/dashSelector');
	// 				else return res.redirect('/login');
	// 			} else return res.redirect('/signUp');
	// 		})
	// 		.catch(err => {
	// 			return res.send(err);
	// 		});
	// } else res.redirect('/login');
});

app.get("/dashPlayer", (req, res) => {
	if (req.cookies.__session) {
		db.collection("users")
			.doc(req.cookies.__session)
			.get()
			.then((doc) => {
				if (doc.exists) {
					if (doc.data().role === "player") {
						return res.render("dashPlayer");
					} else {
						return res.redirect("/Dashboard");
					}
				} else return res.redirect("/signUp");
			})
			.catch((err) => {
				return res.send(err);
			});
	} else res.redirect("/login");
});

app.get("/dashSelector", (req, res) => {
	if (req.cookies.__session) {
		db.collection("users")
			.doc(req.cookies.__session)
			.get()
			.then((doc) => {
				if (doc.exists) {
					if (doc.data().role === "selector") {
						return res.render("dashSelector");
					} else {
						return res.redirect("/Dashboard");
					}
				} else return res.redirect("/signUp");
			})
			.catch((err) => {
				return res.send(err);
			});
	} else res.redirect("/login");
});

app.get("/dashSponsor", (req, res) => {
	if (req.cookies.__session) {
		db.collection("users")
			.doc(req.cookies.__session)
			.get()
			.then((doc) => {
				if (doc.exists) {
					if (doc.data().role === "sponsor") {
						return res.render("dashSponsor");
					} else {
						return res.redirect("/Dashboard");
					}
				} else return res.redirect("/signUp");
			})
			.catch((err) => {
				return res.send(err);
			});
	} else res.redirect("/login");
});

app.get("/dashManager", (req, res) => {
	if (req.cookies.__session) {
		db.collection("users")
			.doc(req.cookies.__session)
			.get()
			.then((doc) => {
				if (doc.exists) {
					if (doc.data().role === "manager") {
						res.render("dashManager");
						// getEvents();
						return;
					} else {
						return res.redirect("/Dashboard");
					}
				} else return res.redirect("/signUp");
			})
			.catch((err) => {
				return res.send(err);
			});
	} else res.redirect("/login");
	function getEvents() {
		console.log("\n\n\n\n", req.cookies.__session);
		console.log("\n\n\n\n", "called");
		var i = 0,
			eventIDArray = new Array(),
			eventDetailsArray = new Array();
		db.collection("users")
			.doc(req.cookies.__session)
			.collection(myEvents)
			.get()
			.then((querySnapshot) => {
				console.log("\n\n\n\n", querySnapshot);
				if (querySnapshot.exists) {
					querySnapshot.forEach((childSnapshot) => {
						console.log("\n\n\n\n", req.cookies.__session);
						eventIDArray[i] = childSnapshot.id;
						eventDetailsArray[i] = childSnapshot.data();
						i++;
					});
					id = Object.assign({}, eventIDArray);
					events = Object.assign({}, eventDetailsArray);
					console.log("\n\n\n\n", events);
					res.render("dashManager", { id, events });
					return;
				} else {
					throw new Error(err);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}
});

app.get("/dashSponsor_Manager", (req, res) => {
	if (req.cookies.__session) {
		db.collection("users")
			.doc(req.cookies.__session)
			.get()
			.then((doc) => {
				if (doc.exists) {
					if (doc.data().role === "sponsor_Manager") {
						return res.render("dashSponsor_Manager");
					} else {
						return res.redirect("/Dashboard");
					}
				} else return res.redirect("/signUp");
			})
			.catch((err) => {
				return res.send(err);
			});
	} else res.redirect("/login");
});

app.get("/fetchUser", (req, res) => {
	db.collection("users")
		.doc(req.cookies.__session)
		.get()
		.then((doc) => {
			if (doc.exists) {
				return res.send(doc.data());
			} else return res.send("UID doesn't exist");
		})
		.catch((err) => {
			return res.send(err);
		});
});

app.use((req, res, next) => {
	res.status(404).render("404");
});

exports.app = functions.https.onRequest(app);
