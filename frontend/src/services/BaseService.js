/* import axios from "axios";
import axiosRetry from "axios-retry"; */

/** This function configure the Axios library **/

var ENVIRONMENTS = {
	PRODUCTION: "https://sample.phraseame.whappme.com/api/v1"
};

var BASE_URL = ENVIRONMENTS.PRODUCTION;

export function GetBaseURL() {
	return BASE_URL;
}

/* export function SetToken(token) {
	localStorage.setItem("JWT_TOKEN", token);
	JWT_TOKEN = token;
}

export function RemoveToken() {
	localStorage.removeItem("JWT_TOKEN");
	JWT_TOKEN = null;
}

export function GetToken() {
	return localStorage.getItem("JWT_TOKEN");
}

export function ApiService(timeout = 25000, headers) {
	if (!headers) {
		headers = {
			Accept: "application/json",
			"Content-Type": "application/json"
		};

		if (localStorage.getItem("JWT_TOKEN")) {
			headers["Authorization"] = "Bearer " + localStorage.getItem("JWT_TOKEN");
		}

		if(localStorage.getItem("keys")) {
			try {
				const keys = JSON.parse(localStorage.getItem("keys"));
				headers["x-api-key"] = keys.api_key;
				headers["x-secret-key"] = keys.secret_key;
			} catch (err) {
				// Do nothing
			}
		}
	}

	// Instance the webservice caller
	var api = axios.create({
		baseURL: getBaseUrl(),
		timeout: timeout,
		headers: headers
	});

	axiosRetry(api, {
		retries: 5,
		retryDelay: retryCount => {
			return retryCount * 1000;
		}
	});

	return api;
}

export function setBaseUrl(baseUrl) {
	if (baseUrl == null) {
		BASE_URL = ENVIRONMENTS.PRODUCTION;
	} else {
		BASE_URL = baseUrl;
	}
}

export function normalizePromise(promise, success, error) {
	promise
		.then(response => {
			if (success) success(response.data);
		})
		.catch(err => {
			if (error) error(err);
		});
}

export function getBaseUrl() {
	return BASE_URL;
}

export function encodeQueryData(parameters) {
	let ret = [];
	for (let d in parameters)
		ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(parameters[d]));
	return ret.join("&");
}
 */