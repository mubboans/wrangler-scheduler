import PrayTime from './prayertime.js';
import { PRESET } from './config.js';

export function getPrayerTimes(date = new Date()) {
	const calc = new PrayTime(PRESET.method);
	calc.location([PRESET.lat, PRESET.lng]);
	calc.timezone(PRESET.tz);
	calc.format('24h');
	return calc.getTimes(date);
}

export function getCurrentISTTime() {
	// Cloudflare Workers run in UTC, convert to IST (UTC+5:30)
	const now = new Date();
	const istOffset = 5.5 * 60 * 60 * 1000;
	return new Date(now.getTime() + istOffset);
}

export function isPrayerTimeNow(prayerTime, currentTime, timeWindow = 1) {
	const [prayerHour, prayerMinute] = prayerTime.split(':').map(Number);
	const currentHour = currentTime.getHours();
	const currentMinute = currentTime.getMinutes();

	// Check if current time is within the time window
	const prayerTotalMinutes = prayerHour * 60 + prayerMinute;
	const currentTotalMinutes = currentHour * 60 + currentMinute;

	return Math.abs(prayerTotalMinutes - currentTotalMinutes) <= timeWindow;
}

export function formatTime(date) {
	return date.toLocaleTimeString('en-IN', {
		timeZone: 'Asia/Kolkata',
		hour12: false,
		hour: '2-digit',
		minute: '2-digit'
	});
}
