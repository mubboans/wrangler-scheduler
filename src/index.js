import { runCron } from "./cron/prayer.cron";
import PrayTime from "./prayertime";

export default {
	async fetch(req, env, ctx) {
		const prayer_time = getPrayerTimes(new Date());
		console.log('Prayer times for today:', prayer_time);

		// Allow manual triggering of cron via HTTP for testing
		const url = new URL(req.url);
		const isManualTrigger = url.searchParams.get('run_cron') === 'true' || url.pathname === '/run_cron';

		if (isManualTrigger) {
			console.log('🔄 Manually triggering cron via HTTP');
			ctx.waitUntil(runCron());
			return new Response('Cron triggered in background', { status: 200 });
		}

		return new Response(JSON.stringify(prayer_time, null, 2), {
			headers: { 'content-type': 'application/json' },
		});
	},

	async scheduled(event, env, ctx) {
		console.log(`⏰ Scheduled event triggered at ${event.cron}`);
		ctx.waitUntil(runCron());
	},
};

const PRESET = {
	lat: 19.076,
	lng: 72.8777,
	tz: 'Asia/Kolkata',
	method: 'MWL',
};

function getPrayerTimes(date) {
	const calc = new PrayTime(PRESET.method);
	calc.location([PRESET.lat, PRESET.lng]);
	calc.timezone(PRESET.tz);
	calc.format('24h');

	return calc.getTimes(date);
}
