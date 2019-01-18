import * as Mailgun from 'mailgun-js';

/**
 * Create a NodeMailgun mailer.
 * 	You must create a new NodeMailgun() instance, set the necessary members (below),
 * 	and then call init().  After initialization, you can then call send() to send an
 * 	email.
 * 
 * 	Necessary Members:
 * 		- apiKey Mailgun API Key
 * 		- domain Mailgun registered domain
 * 		- fromEmail Email address to send from (Does not have to exist)
 * 		- fromTitle Email address sender name
 * 
 * @param apiKey string (Optional) Mailgun API Key
 * @param domain string (Optional) Mailgun registered domain
 */
export class NodeMailgun {
	// Mailgun core object
	public mailgun;

	// Mailgun API Key
	public apiKey: string;

	// Mailgun Domain Name
	public domain: string;

	// Sender email address
	public fromEmail: string;

	// From email title
	public fromTitle: string;

	// String to prepend to message subject
	public subjectPre?: string = '';

	// String to append to message subject
	public subjectPost?: string = '';

	// Message body header
	public header?: string = '';

	// Message body footer
	public footer?: string = '';

	/**
	 * Constructor
	 * @param apiKey (Optional) string Mailgun API Key
	 * @param domain (Optional) string Mailgun registered domain
	 */
	constructor(apiKey?: string, domain?: string) {
		// Set mailgun config
		this.apiKey = apiKey;
		this.domain = domain;
	}

	/**
	 * Initialize
	 */
	public init() {
		// Check input
		if (!this.apiKey) {
			throw new Error('Please pass a valid API Key to NodeMailgun()');
		}

		if (!this.domain) {
			throw new Error('Please pass a valid domain to NodeMailgun()');
		}

		if (!this.fromEmail) {
			throw new Error('Please set NodeMailgun::fromEmail');
		}

		if (!this.fromTitle) {
			throw new Error('Please set NodeMailgun::fromTitle');
		}

		// Initialize Mailgun
		this.mailgun = new Mailgun({
			apiKey: this.apiKey,
			domain: this.domain
		});

		return this;
	}

	/**
	 * Send a message
	 * @param to string Email Address to send message to
	 * @param subject string Message subject
	 * @param body string Message body
	 */
	public send(to: string, subject: string, body: string) {
		return new Promise(async (accept, reject) => {
			// Check mailgun
			if (!this.mailgun) {
				reject(
					'Please call NodeMailgun::init() before sending a message!'
				);

				return;
			}

			// Create subject
			subject = this.subjectPre + subject + this.subjectPost;

			// Create body
			body = this.header + body + this.footer;

			// Create message parts
			const message = {
				from: `${this.fromTitle} <${this.fromEmail}>`,
				to: to,
				subject: subject,
				html: body
			};

			// Send email
			this.mailgun.messages().send(message, (error, body) => {
				// Pass result through Promise
				error ? reject(error) : accept(body);
			});
		});
	}
}
