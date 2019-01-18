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
});
...
```

View the complete [NodeMailgun example](https://github.com/StatelessStudio/node-mailgun/blob/master/test/example.ts)

## Mailing List

### Create a Mailing List

Create a mailing list on Mailgun, and copy the alias address it generates.

### Setup

After you call `NodeMailgun::init()`, you will need to initialize the list:

Example:
```typescript
...
mailer.initMailingList('mylist@mail.my-app.com')
...
```

### Adding Members

```typescript
...
mailer.listAdd('john.doe@example.com', 'John Doe', { role: 'Admin' })
	.then(() => consoleog('Done'))
	.catch((error) => console.error(error));
...
```

### Updating Members

```typescript
mailer.listUpdate('john.doe@example.com', { name: 'Don Boe' })
	.then(() => console.log('Done'))
	.catch((error) => console.error(error));
```

### Unsubscribe Members

```typescript
mailer.listRemove('john.doe@example.com')
	.then(() => console.log('Done'))
	.catch((error) => console.error(error));
```

### Get List

Get your mailing list for administration or for bulk sending.  You can also filter and map your users before passing to `send()`.

#### getList()

`getList()` gets an array of all users in the list, as objects

```typescript
mailer.getList()
	.then((list) => console.log('List: ', list))
	.catch((error) => console.error('Error: ', error));
```

#### getListAddresses()

`getListAddresses()` get an array of email addresses in the list, as strings

```typescript
mailer.getListAddresses()
	.then((list) => console.log('List: ', list))
	.catch((error) => console.error('Error: ', error));
```

### Complete Example

```typescript
const newsletter = new NodeMailgun();
newsletter.apiKey = 'xxxxxxxxxxxxxxxxxxxxxxx';
newsletter.domain = 'my-app.com';
newsletter.fromEmail = 'newsletter@my-app.com';
newsletter.fromTitle = 'My App Newsletter';

async function main() {
	// Add a member
	await newsletter.listAdd('tom@example.com', 'Tom Example', {
		id: 12,
		role: 'Admin'
	}).catch((error) => console.error('Error: ', error));

	// Get list
	const list = await newsletter.getList()
		.catch((error) => console.error('Error: ', error));

	// Send mail
	await mailer
		.listSend('Newsletter', 'i got news 4 u %recipient.name%', users)
		.catch(console.error);
}

main();
```

## Unsubscribe Link

We recommend adding an Unsubscribe Link.  A default "Unsubscribe" link will be included at the bottom of the email, but you can customize this link if you'd like.

### Disable Link
```typescript
mailer.unsubscribeLink = false;
```

### Custom Link
```typescript
mailer.unsubscribeLink = '<a href="%unsubscribe_url%">Unsubscribe from Cool Emails</a>';
```
