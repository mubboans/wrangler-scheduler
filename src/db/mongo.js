import mongoose from 'mongoose';
import { ENV } from '../config/env.js';

let isConnected = false;

export async function connectMongo() {
	if (isConnected || mongoose.connection.readyState === 1) {
		console.log('✅ Using existing MongoDB connection');
		return;
	}

	if (!ENV.DBURL) throw new Error('MONGO_URI/DBURL missing');

	try {
		const db = await mongoose.connect(ENV.DBURL, {
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
		});

		isConnected = db.connections[0].readyState === 1;
		console.log('✅ MongoDB connected');

		mongoose.connection.on('error', (err) => {
			console.error('❌ MongoDB connection error:', err);
			isConnected = false;
		});

		mongoose.connection.on('disconnected', () => {
			console.warn('⚠️ MongoDB disconnected');
			isConnected = false;
		});

	} catch (error) {
		console.error('❌ Failed to connect to MongoDB:', error);
		throw error;
	}
}
