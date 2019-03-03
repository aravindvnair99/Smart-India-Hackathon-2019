importScripts('https://www.gstatic.com/firebasejs/5.8.4/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.8.4/firebase-messaging.js');
firebase.initializeApp({
	messagingSenderId: '254746284439'
});
const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(function(payload) {
	console.log(
		'[firebase-messaging-sw.js] Received background message ',
		payload
	);
	const notificationTitle = 'Equity Sports';
	const notificationOptions = {
		body: 'Hey there!',
		icon: '/android-chrome-192x192.png'
	};

	return self.registration.showNotification(
		notificationTitle,
		notificationOptions
	);
});
