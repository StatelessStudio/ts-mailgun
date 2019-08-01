import * as fs from 'fs';
import * as Mailgun from 'mailgun-js';
import * as Handlebars from 'handlebars';
import { MailgunTemplate } from './mailgun-template';

/**
 * Create a NodeMailgun mailer.
 * 	You must create a new NodeMailgun() instance, set the necessary members (below),
 * 	and then call init(). After initialization, you can then call send() to send an
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
	public mailgun: Mailgun.Mailgun;

	// Test mode
	public testMode = false;

	// Mailgun API Key
	public apiKey: string;

	// Mailgun Domain Name
	public domain: string;

	// Mailgun list name
	public list?: any;

	// Templates
	public templates = {};

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

	// Unsubscribe link
	public unsubscribeLink?: boolean | string = true;

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
	 * Get the template object by keyname
	 * @param name Keyname of the template
	 */
	getTemplate(name: string): boolean | MailgunTemplate {
		if (name in this.templates) {
			return this.templates[name];
		}
		else {
			return false;
		}
	}

	/**
	 * Initialize mailing list
	 * @param list Address to find list by
	 */
	public initMailingList(list: string) {
		// Check input
		if (!list) {
			throw new Error('Please supply a mailing list');
		}

		if (!this.mailgun) {
			throw new Error(
				'Please run NodeMailgun::init() before \
				::initMailingList()'
			);
		}

		// Get lists
		this.list = this.mailgun.lists(list);

		return this;
	}

	/**
	 * Send a message
	 * @param to string | string[] Email Address to send message to
	 * @param subject string Message subject
	 * @param body string Message body
	 */
	public send(
		to: string | string[],
		subject: string,
		body: string,
		templateVars = {}
	): Promise<any> {
		return new Promise((accept, reject) => {
			if (this.testMode) {
				accept();
				return;
			}

			// Check mailgun
			if (!this.mailgun) {
				reject(
					'Please call NodeMailgun::init() before sending a message!'
				);

				return;
			}

			// Create subject
			subject = this.subjectPre + subject + this.subjectPost;

			// Create unsubscribe link
			let unsubscribeLink;
			if (this.unsubscribeLink === true) {
				unsubscribeLink =
					'<br><br><a href="%unsubscribe_url%">Unsubscribe</a>';
			}
			else if (typeof this.unsubscribeLink === 'string') {
				unsubscribeLink = '<br><br>' + this.unsubscribeLink;
			}
			else {
				unsubscribeLink = '';
			}

			// Create body
			body = this.header + body + this.footer + unsubscribeLink;

			// Create message parts
			const message = {
				from: `${this.fromTitle} <${this.fromEmail}>`,
				to: to,
				subject: subject,
				html: body,
				'recipient-variables': templateVars
			};

			// Send email
			this.mailgun.messages().send(message, (error, result) => {
				// Pass result through Promise
				error ? reject(error) : accept(result);
			});
		});
	}

	/**
	 * Send a message from a template
	 * @param to string | string[] Email Address to send message to
	 * @param subject string Message subject
	 * @param body string Message body
	 */
	public sendFromTemplate(
		to: string | string[],
		template: MailgunTemplate,
		templateVars = {}
	): Promise<any> {
		let subject, body;

		const subjectCompiler = Handlebars.compile(template.subject);
		const bodyCompiler = Handlebars.compile(template.body);

		let allVars = {};
		allVars = Object.assign(allVars, templateVars);
		allVars = Object.assign(allVars, process.env);

		subject = subjectCompiler(allVars);
		body = bodyCompiler(allVars);

		return this.send(to, subject, body, templateVars);
	}

	/**
	 * Get list data of the current mailing list
	 */
	public getList(): Promise<any> {
		return new Promise((accept, reject) => {
			this.list.members().list((error, result) => {
				error ? reject(error) : accept(result);
			});
		});
	}

	/**
	 * Get array of addresses in the current mailing list
	 */
	public getListAddresses(): Promise<any> {
		return new Promise((accept, reject) => {
			this.getList()
				.then((list) => {
					const addresses = [];

					for (let user of list.items) {
						if ('address' in user) {
							addresses.push(user.address);
						}
					}

					accept(addresses);
				})
				.catch((error) => reject(error));
		});
	}

	/**
	 * Add a member to the current mailing list
	 * @param address Email address to add
	 * @param name User's name
	 * @param data User data
	 */
	public listAdd(address: string, name: string, data: any): Promise<any> {
		return new Promise((accept, reject) => {
			// Check initialization
			if (!this.mailgun || !this.list) {
				reject(
					'Please call NodeMailgun::initMailingList()\
					before adding to a list.'
				);

				return;
			}

			// Create user object
			const user = {
				subscribed: true,
				address: address,
				name: name,
				vars: data
			};

			// Add user to list
			this.list.members().create(user, (error, result) => {
				error ? reject(error) : accept(result);
			});
		});
	}

	/**
	 * Update a user in the list
	 * @param address Email address to add
	 * @param data User data
	 * 		address: string,
	 * 		name: string,
	 * 		vars: Object
	 */
	public listUpdate(address: string, data: any): Promise<any> {
		return new Promise((accept, reject) => {
			// Check initialization
			if (!this.mailgun || !this.list) {
				reject(
					'Please call NodeMailgun::initMailingList()\
					before updating a list.'
				);

				return;
			}

			// Update user
			this.list.members(address).update(data, (error, result) => {
				error ? reject(error) : accept(result);
			});
		});
	}

	/**
	 * Unsubscribe a user from the list
	 * @param address Email address to remove
	 */
	public listRemove(address: string): Promise<any> {
		return new Promise((accept, reject) => {
			// Check initialization
			if (!this.mailgun || !this.list) {
				reject(
					'Please call NodeMailgun::initMailingList()\
					before removing from a list.'
				);

				return;
			}

			// Update user
			this.list.members(address).delete((error, result) => {
				error ? reject(error) : accept(result);
			});
		});
	}

	/**
	 * Send to list
	 * @param newsletter Newsletter address to send to
	 * @param subject Message subject
	 * @param body Message body HTML
	 */
	public listSend(
		newsletter: string,
		subject: string,
		body: string
	): Promise<any> {
		return this.send(newsletter, subject, body, {});
	}

	/**
	 * Load header from template file
	 * @param file Template file path
	 */
	public loadHeaderTemplate(file: string) {
		const hbs = Handlebars.compile(
			fs.readFileSync(file, { encoding: 'utf8' })
		);

		this.header = hbs(process.env);
	}

	/**
	 * Load footer from template file
	 * @param file Template file path
	 */
	public loadFooterTemplate(file: string) {
		const hbs = Handlebars.compile(
			fs.readFileSync(file, { encoding: 'utf8' })
		);

		this.footer = hbs(process.env);
	}
}
