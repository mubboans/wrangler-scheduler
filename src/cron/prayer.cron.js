import { connectMongo } from '../db/mongo.js';
import { NotificationQueue } from '../db/models.js';
import { nowInTZ } from '../utils/time.js';
import { createQueue } from '../utils/queue-helper.js';
import { sendPrayerNotification } from '../utils/notification-trigger.js';

export async function runCron() {
	try {
		await connectMongo();

		const now = nowInTZ();
		await createQueue(now);

		const due = await NotificationQueue.find({
			status: 'pending',
			scheduledAt: { $lte: now },
		});
		console.log(`🔍 [DEBUG] due.find() returned ${due.length} items. Now: ${now}`);
		console.log(due, now, 'notification due with query');
		if (due.length > 0) {
			console.log(`🚀 Found ${due.length} pending notifications`);
			for (const job of due) {
				console.log(`Processing job for ${job.prayer}...`);
				try {
					console.log(`Calling sendPrayerNotification for ${job.prayer}...`);
					await sendPrayerNotification(job.prayer, job.scheduledAt.toTimeString().slice(0, 5));
					console.log(`Done sendPrayerNotification for ${job.prayer}.`);
					job.status = 'sent';
					job.sentAt = new Date();
				} catch (err) {
					console.error(`❌ Failed to send notification for ${job.prayer}:`, err);
					job.status = 'failed';
					job.lastError = err.message;
				}
				await job.save();
			}
		} else {
			// console.log('💤 No pending notifications');
		}

		console.log('✅ Cron finished successfully');
	} catch (error) {
		console.error('❌ Critical error in prayer cron:', error);
		throw error; // Re-throw to ensure worker runtime knows it failed
	}
}
