import { NotificationQueue } from '../db/models.js';
import { getPrayerTimes } from '../prayer-calculator.js';

import { nowInTZ, dateKey } from '../utils/time.js';

export async function createQueue(date) {
	const times = getPrayerTimes(date);
	const now = nowInTZ();

	for (const [prayer, time] of Object.entries(times)) {
		const [h, m] = time.split(':');
		const scheduledAt = new Date(now);
		scheduledAt.setHours(h, m, 0, 0);

		if (scheduledAt <= now) continue;

		await NotificationQueue.updateOne(
			{ prayer, dayDate: dateKey(date) },
			{ $setOnInsert: { prayer, scheduledAt } },
			{ upsert: true }
		);
	}
}
