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
	public mailgun: Mailgun.Mailgun;

	// Test mode
	public testMode = false;

	// Mailgun API Key
	public apiKey: string;

	// Mailgun Domain Name
	public domain: string;

	// Mailgun list name
	public list?: Mailgun.Lists;

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
					before adding to a list.'
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
		return this.listUpdate(address, { subscribed: false });
	}

	/**
	 * Send to list
	 * @param subject string Message subject
	 * @param body string Message body HTML
	 * @param users any[] Array of users to send to
	 * @param userAddressKey string (Optional) User email address key to send to
	 * 	Default is 'address'
	 */
	public listSend(
		subject: string,
		body: string,
		users: Object[],
		userAddressKey = 'address'
	): Promise<any> {
		return new Promise((accept, reject) => {
			// Build to array
			const to = [];
			const vars = {};

			if (users instanceof Object && 'items' in users) {
				users = users['items'];
			}

			for (let user of users) {
				if (user instanceof Object) {
					if (userAddressKey in user) {
						const address = user[userAddressKey];
						to.push(address);

						vars[address] = user;
					}
					else {
						reject(
							`Address key "${userAddressKey}" does not exist in user`
						);
					}
				}
				else {
					reject('Array of users must be array of Objects');
				}
			}

			// Build subject
			subject = this.subjectPre + subject + this.subjectPost;

			// Build body
			body = this.header + body + this.footer;

			// Send message
			this.send(to, subject, body, vars).then(accept).catch(reject);
		});
	}
}
