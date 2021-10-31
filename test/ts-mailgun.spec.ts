import { NodeMailgun } from '../src/';
import { env } from '../example/environment';

describe('ts-mailgun', () => {
	let mailgun: NodeMailgun;
	const isTestMode = env.MAILGUN_TEST_MODE;
	let captured: any[] = [];

	const getCaptured = () => captured[1];

	beforeEach(() => {
		mailgun = new NodeMailgun(
			env.MAILGUN_API_KEY,
			env.MAILGUN_DOMAIN
		);

		mailgun.fromEmail = env.MAILGUN_FROM_EMAIL;
		mailgun.fromTitle = env.APP_TITLE;
		mailgun.testMode = isTestMode;
		mailgun.testModeLogger = (...a) => {
			captured = a;
		};
		mailgun.init();
	});

	afterEach(() => {
		captured = [];
	});

	it('can send', async () => {
		const subject = 'can load test';
		const body = 'testing if NodeMailgun can send';

		const response = await mailgun.send(
			env.TEST_EMAIL_TO,
			subject,
			body
		);

		const captured = getCaptured();

		if (isTestMode) {
			expect(captured.subject).toEqual(subject);
			expect(captured.html).toContain(body);
		}

		expect(response).toBeUndefined();
	});
});
