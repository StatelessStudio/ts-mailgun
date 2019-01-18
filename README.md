# node-mailgun
Typescript Mailgun wrapper for sending emails from NodeJS

## Prerequisites

- Create mailgun account (https://www.mailgun.com/)
- Add DNS records

## Installation

```
npm i StatelessStudio/node-mailgun
```

## Sending Mail

```typescript
import { NodeMailgun } from 'node-mailgun';

const mailer = new NodeMailgun();
mailer.apiKey = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // Set your API key
mailer.domain = 'mail.my-sample-app.com'; // Set the domain you registered earlier
mailer.fromEmail = 'noreply@my-sample-app.com'; // Set your from email
mailer.fromTitle = 'My Sample App'; // Set the name you would like to send from

mailer.init();

// Send an email to test@example.com
mailer
	.send('test@example.com', 'Hello!', '<h1>hsdf</h1>')
	.then((result) => console.log('Done', result))
	.catch((error) => console.error('Error: ', error));

```

or if you're using Express:

```typescript
// Make sure you init() NodeMailgun before you start your server!
...
router.post('/', (request, response, next) => {
	mailer.send
		.send('test@example.com', 'Hello!', '<h1>hsdf</h1>')
		.then(() => next())
		.catch((error) => response.sendStatus(500));
})
...
```
