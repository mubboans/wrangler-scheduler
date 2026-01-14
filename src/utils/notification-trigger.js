import admin from '../config/firebase.js';
import { NotificationHistory, FCM_DEVICE_TOKEN } from '../db/models.js';
import { dateKey } from '../utils/time.js';

const BATCH = 500;

export async function sendPrayerNotification(prayer, time) {
	try {
		console.log('🔍 [DEBUG] sendPrayerNotification: Fetching tokens...');
		const tokens = await FCM_DEVICE_TOKEN.find().lean();
		console.log(`🔍 [DEBUG] sendPrayerNotification: Found ${tokens.length} tokens.`);

		if (!tokens.length) {
			console.log('⚠️ No devices found for notification');
			return;
		}

		console.log(`📨 Sending ${prayer} notification to ${tokens.length} devices...`);

		const payload = {
			notification: {
				title: `${prayer} prayer`,
				body: `It's time for ${prayer} at ${time}`,
			},
		};

		let successCount = 0;
		let failureCount = 0;

		for (let i = 0; i < tokens.length; i += BATCH) {
			const slice = tokens.slice(i, i + BATCH);
			const batchTokens = slice.map(t => t.fcmToken).filter(t => t); // Filter empty tokens

			if (batchTokens.length === 0) continue;

			try {
				console.log(`🔍 [DEBUG] Sending batch ${i} via admin.messaging()...`);
				const resp = await admin.messaging().sendEachForMulticast({
					...payload,
					tokens: batchTokens,
				});
				console.log(`🔍 [DEBUG] Batch ${i} sent. Success: ${resp.successCount}, Failure: ${resp.failureCount}`);

				successCount += resp.successCount;
				failureCount += resp.failureCount;

				if (resp.responses && resp.responses.length > 0) {
					const historyEntries = resp.responses.map((r, idx) => ({
						token: batchTokens[idx],
						prayer,
						status: r.success ? 'sent' : 'failed',
						error: r.error ? r.error.message : null,
						sentAt: new Date(),
						dayDate: dateKey(),
					}));

					await NotificationHistory.insertMany(historyEntries);
				}
			} catch (batchError) {
				console.error(`❌ Batch error for slice ${i}:`, batchError);
				// Continue to next batch instead of crashing entirely
			}
		}

		console.log(`📊 Notification summary: ${successCount} sent, ${failureCount} failed`);
	} catch (error) {
		console.error('❌ Error in sendPrayerNotification:', error);
		// Do not throw, just log. We don't want to crash the whole cron if notification service fails, 
		// but we might want to mark the job as failed? 
		// logic in caller handles job status. If this throws, job marked failed.
		throw error;
	}
}
