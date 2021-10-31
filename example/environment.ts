import * as dotenv from 'dotenv';
const envfile = dotenv.config();

/**
 * Environment Variables Schema
 */
export class Environment {
	APP_TITLE = 'My Sample App';

	MAILGUN_TEST_MODE = true;
	MAILGUN_API_KEY = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
	MAILGUN_DOMAIN = 'mail.my-sample-app.com';
	MAILGUN_FROM_EMAIL = 'noreply@my-sample-app.com';
	MAILGUN_NEWSLETTER = 'newsletter@my-sample-app.com';

	TEST_EMAIL_TO = 'johndoe@example.com';
	TEST_EMAIL_IMAGE = 'example/assets/images/jpg.png';
}

// Export
export const env: Environment = Object.assign(
	new Environment(),
	envfile.parsed
);

env.MAILGUN_TEST_MODE = envfile.parsed.MAILGUN_TEST_MODE === 'true' ? true : false;
