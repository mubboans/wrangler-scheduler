
export class NotificationService {
	constructor(env) {
		this.env = env;
	}

	async sendPrayerNotification(prayerName, prayerTime, additionalData = {}) {
		try {
			console.log(`🔔 Sending notification for ${prayerName} at ${prayerTime}`);

			// Example: Firebase FCM notification
			if (this.env.FIREBASE_SERVER_KEY) {
				await this.sendFCMNotification(prayerName, prayerTime, additionalData);
			}

			// Example: Web push notification
			if (this.env.WEB_PUSH_VAPID_PRIVATE_KEY) {
				await this.sendWebPushNotification(prayerName, prayerTime, additionalData);
			}

			// Example: Call external API
			if (this.env.NOTIFICATION_WEBHOOK_URL) {
				await this.sendWebhookNotification(prayerName, prayerTime, additionalData);
			}

			// Log notification
			await this.logNotification(prayerName, prayerTime);

			return { success: true, message: `Notification sent for ${prayerName}` };
		} catch (error) {
			console.error(`❌ Failed to send notification for ${prayerName}:`, error);
			return { success: false, error: error.message };
		}
	}

	async sendFCMNotification(prayerName, prayerTime, data) {
		const message = {
			notification: {
				title: `🕌 ${prayerName.charAt(0).toUpperCase() + prayerName.slice(1)} Prayer Time`,
				body: `It's time for ${prayerName} prayer (${prayerTime} IST)`,
			},
			data: {
				prayer: prayerName,
				time: prayerTime,
				type: 'prayer_reminder',
				...data
			},
			// topic: 'prayer-notifications', // or specific device tokens
		};

		await fetch('https://fcm.googleapis.com/fcm/send', {
			method: 'POST',
			headers: {
				'Authorization': `key=${this.env.FIREBASE_SERVER_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(message),
		});
	}

	async sendWebPushNotification(prayerName, prayerTime, data) {
		// Implementation for web push notifications
		console.log(`Web push: ${prayerName} at ${prayerTime}`);
	}

	async sendWebhookNotification(prayerName, prayerTime, data) {
		await fetch(this.env.NOTIFICATION_WEBHOOK_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				prayer: prayerName,
				time: prayerTime,
				timestamp: new Date().toISOString(),
				location: 'Mumbai',
				...data
			}),
		});
	}

	async logNotification(prayerName, prayerTime) {
		// Store notification log for analytics
		const logEntry = {
			prayer: prayerName,
			time: prayerTime,
			timestamp: new Date().toISOString(),
			notifiedAt: new Date().toISOString(),
		};

		// You could store this in KV, D1, or send to analytics service
		console.log('Notification logged:', logEntry);
	}
}
