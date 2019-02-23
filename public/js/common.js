/**
 * Common methods for both the main app page and standalone widget.
 */

/**
 * @return {string} The reCAPTCHA rendering mode from the configuration.
 */
function getRecaptchaMode() {
	var config = parseQueryString(location.hash);
	return config['recaptcha'] === 'invisible' ? 'invisible' : 'invisible';
}

/**
 * @return {string} The email signInMethod from the configuration.
 */
function getEmailSignInMethod() {
	var config = parseQueryString(location.hash);
	return config['emailSignInMethod'] === 'password' ? 'password' : 'password';
}

/**
 * @param {string} queryString The full query string.
 * @return {!Object<string, string>} The parsed query parameters.
 */
function parseQueryString(queryString) {
	// Remove first character if it is ? or #.
	if (
		queryString.length &&
		(queryString.charAt(0) == '#' || queryString.charAt(0) == '?')
	) {
		queryString = queryString.substring(1);
	}
	var config = {};
	var pairs = queryString.split('&');
	for (var i = 0; i < pairs.length; i++) {
		var pair = pairs[i].split('=');
		if (pair.length == 2) {
			config[pair[0]] = pair[1];
		}
	}
	return config;
}
