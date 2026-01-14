import 'dotenv/config';

export const ENV = {
	DBURL: process.env.DBURL || process.env.MONGO_URI,
	FIREBASE_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
};
