import { NodeMailgun } from '../src/ts-mailgun';

// Setup mailgun
const mailer = new NodeMailgun();
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
		.listSend('Newsletter', 'i got news 4 u %recipient.name%', users)
		.catch(console.error);
}

main();
