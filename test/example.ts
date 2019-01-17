import { NodeMailgun } from '../src/node-mailgun';

const mailer = new NodeMailgun();
mailer.apiKey = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
mailer.domain = 'mail.my-sample-app.com';
mailer.fromEmail = 'noreply@my-sample-app.com';
mailer.fromTitle = 'My Sample App';

mailer
	.init()
	.send('test@example.com', 'Hello!', '<h1>hsdf</h1>')
	.then((result) => console.log('Done', result))
	.catch((error) => console.error('Error: ', error));
