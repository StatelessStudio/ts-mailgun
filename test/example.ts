import { NodeMailgun, Attachment } from '../src/';
import * as fs from 'fs';

// Setup mailgun
const mailer = new NodeMailgun();
mailer.testMode = true;
mailer.apiKey = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
mailer.domain = 'mail.my-sample-app.com';
mailer.fromEmail = 'noreply@my-sample-app.com';
mailer.fromTitle = 'My Sample App';

// Initialize mailgun & newsletter mailing list
mailer.init();
mailer.initMailingList('newsletter@mail.my-sample-app.com');

// Async function
async function main() {
	// Send email to john.doe@example.com
	await mailer
		.send('john.doe@example.com', 'Hello John', '<h1>John,</h1>')
		.catch(console.error);

	// Add user to mailing list
	await mailer
		.listAdd('john.doe@example.com', 'John Doe', { id: 1 })
		.catch(console.error);

	// Get user list
	let users = await mailer.getList().catch(console.error);

	// Send mailing list
	await mailer
		.listSend('newsletter@mg.stateless.studio', 'Test Newsletter %recipient_name%', `This newsletter is a test!`)
		.catch(console.error);

	// Send file image
	await mailer.send(
		'john.doe@example.com',
		'File Image',
		'sadf',
		{},
		{
			attachment: '~/Downloads/jpg.png'
		}
	);

	// Send buffer image
	await mailer.send(
		'john.doe@example.com',
		'Buffer Image',
		'sadf',
		{},
		{
			attachment: fs.readFileSync('~/Downloads/jpg.png')
		}
	)

	// Send stream image
	await mailer.send(
		'john.doe@example.com',
		'Stream Image',
		'sadf',
		{},
		{
			attachment: fs.createReadStream('~/Downloads/jpg.png')
		}
	);
}

main();
