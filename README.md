# ts-mailgun
Typescript Mailgun wrapper for sending emails in NodeJS

Created and maintained by [Stateless Studio](https://stateless.studio)

## Prerequisites

- Create mailgun account (https://www.mailgun.com/)
- Add DNS records

## Installation

```
npm i ts-mailgun
```

## Sending Mail

```typescript
import { NodeMailgun } from 'ts-mailgun';

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
	mailer
		.send('test@example.com', 'Hello!', '<h1>hsdf</h1>')
		.then(() => next())
		.catch((error) => response.sendStatus(500));
});
...
```

View the complete [NodeMailgun example](https://github.com/StatelessStudio/ts-mailgun/blob/master/test/example.ts)

## Mailgun Options

You may set additional Mailgun options before initializing by setting `NodeMailgun::options`:

```typescript
const mailer = new NodeMailgun();
mailer.apiKey = 'XXXXXXXXXXXXXXXXXXXXXXXXX';
mailer.domain = 'mail.my-sample-app.com';

// Setting Mailgun options
mailer.options = {
	host: 'api.eu.mailgun.net'
};

mailer.init();
```

A full list of options may be found here:
https://www.npmjs.com/package/mailgun-js#options

## Mail Options

You may add additional options to `send()` by passing an object to `sendOptions`.

### Attachments

View the Mailgun documentation: https://www.npmjs.com/package/mailgun-js#attachments 

```typescript
const filepath = path.join(__dirname, 'mailgun_logo.png');

mailer.send(
	'john.doe@example.com',
	'Hello',
	'Testing some Mailgun awesomeness!',
	{},
	{ attachment: filepath } // Set attachment
);
```

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
mailer.listAdd('john.doe@example.com', 'John Doe', { role: 'Admin' })
	.then(() => console.log('Done'))
	.catch((error) => console.error(error));
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

Get your mailing list for administration or for bulk sending. You can also filter and map your users before passing the list to `send()`.

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
		.listSend('newsletter@my-app.com', 'Newsletter', 'Hello %recipient.name%!')
		.catch(console.error);
}

main();
```

## Unsubscribe Link

We recommend adding an Unsubscribe Link. A default "Unsubscribe" link will be included at the bottom of the email, but you can customize this link if you'd like.

### Disable Link
```typescript
mailer.unsubscribeLink = false;
```

### Custom Link
```typescript
mailer.unsubscribeLink = '<a href="%unsubscribe_url%">Unsubscribe from Cool Emails</a>';
```

## Test-Mode

To enable test mode, set `mailer.testMode` to true. Send functions will automatically accept without sending.

## Templates

You can create templates as a `MailgunTemplate`, exported from `ts-mailgun/mailgun-template`. This accepts a subject and body.

Templates use Handlebars as the template language, so you can create templates with variables which will be rendered on send.

Set `mailer.templates` to a map of templates:

```typescript

mailer.templates['welcome'] = new MailgunTemplate();
mailer.templates['welcome'].subject = 'Welcome, {{username}}';
mailer.templates['welcome'].body = '<h1>Email: {{email}}</h1>';

```

### Sending with a Template

You can use a template to send your messages. This will render the template for the data you set.

```typescript
// Send email
let template = mailer.getTemplate('welcome');

if (template && template instanceof MailgunTemplate) {
	await mailer
		.sendFromTemplate('testuser@example.com', template, {
			username: 'testuser',
			email: 'testuser@example.com'
		})
		.catch((error) => {
			console.error(error);
		});
}
```


### Sending with a Template stored in Mailgun
To send via a pre-stored template, leave the body empty and define the template name via:

```typescript
	sendOptions.template = 'TEMPLATENAME'
```


### Loading Header & Footer from HTML Templates

You can load the header & footer from HTML templates:

```typescript
	// Load mailer header/footer
	mailer.loadHeaderTemplate('assets/html/email-header.html');
	mailer.loadFooterTemplate('assets/html/email-footer.html');
```

If you use an unsubscribe link in your footer template, you will want to disable the default link:

```typescript
	mailer.unsubscribeLink = false;
```

## Accessing the Mailgun object directly

The `Mailgun` object is exposed through `NodeMailgun::mailgun`, so you can access it directly

### Generic Requests

If you'd like to send Generic Requests (https://www.npmjs.com/package/mailgun-js#generic-requests), you may use the `mailgun` member:

```typescript
const mailer = new NodeMailgun();

...

mailer.init();

mailer.mailgun.get(
	'/samples.mailgun.org/stats',
	{ event: ['sent', 'delivered'] },
	function (error, body) {
		console.log(body);
	}
);
```
