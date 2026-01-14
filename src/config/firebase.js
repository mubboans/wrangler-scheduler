import admin from 'firebase-admin';
const serviceJson = require("../../serviceAccountKey.json")
import { ENV } from './env.js';

let serviceAccount;

if (ENV.FIREBASE_JSON) {
	serviceAccount = JSON.parse(ENV.FIREBASE_JSON);
} else {

	serviceAccount = JSON.parse(serviceJson);
}

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});
}

export default admin;
