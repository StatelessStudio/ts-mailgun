import { NodeMailgun, Attachment } from '../src/';
import * as fs from 'fs';

import { env } from './environment';

// Setup mailgun
const mailer = new NodeMailgun();
mailer.testMode = env.MAILGUN_TEST_MODE;
mailer.apiKey = env.MAILGUN_API_KEY;
mailer.domain = env.MAILGUN_DOMAIN;
mailer.fromEmail = env.MAILGUN_FROM_EMAIL;
mailer.fromTitle = env.APP_TITLE;

// Initialize mailgun & newsletter mailing list
mailer.init();
mailer.initMailingList(env.MAILGUN_NEWSLETTER);

// Async function
async function main() {
	// Send email to drewimmerman@gmail.com
	await mailer
		.send(env.TEST_EMAIL_TO, 'Hello John', '<h1>John,</h1>')
		.catch(console.error);

	// Add user to mailing list
	await mailer
		.listAdd(env.TEST_EMAIL_TO, 'John Doe', { id: 1 })
		.catch(console.error);

	// Get user list
	const users = await mailer.getListAddresses().catch(console.error);
	console.log('users', users);

	// Send mailing list
	await mailer
		.listSend(env.MAILGUN_NEWSLETTER, 'Test Newsletter %recipient_name%', 'This newsletter is a test!')
		.catch(console.error);

	// Send file image
	await mailer.send(
		env.TEST_EMAIL_TO,
		'File Image',
		'sadf',
		{},
		{
			attachment: env.TEST_EMAIL_IMAGE
		}
	);

	// Send buffer image
	await mailer.send(
		env.TEST_EMAIL_TO,
		'Buffer Image',
		'sadf',
		{},
		{
			attachment: fs.readFileSync(env.TEST_EMAIL_IMAGE)
		}
	);

	// Send stream image
	await mailer.send(
		env.TEST_EMAIL_TO,
		'Stream Image',
		'sadf',
		{},
		{
			attachment: fs.createReadStream(env.TEST_EMAIL_IMAGE)
		}
	);

	// Send attachment object
	await mailer.send(
		env.TEST_EMAIL_TO,
		'Attachment Object',
		'sadf',
		{},
		{
			attachment: new Attachment({
				data: fs.createReadStream(env.TEST_EMAIL_IMAGE),
				filename: 'bob.png'
			})
		}
	);
}

main()
	.then(console.log)
	.catch(console.error);
