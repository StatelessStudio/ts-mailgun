import * as fs from 'fs';

const FormData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(FormData);

import Client from 'mailgun.js/dist/lib/client';

import * as Handlebars from 'handlebars';
import { MailgunTemplate } from './mailgun-template';
import {
	DeprecatedMailgunOptions,
	MailgunTransition
} from './mailgun-transition';

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
	// Test mode
	public testMode = false;

	// Test mode logger
	public testModeLogger: Function = console.log;

	// Mailgun API Key
	public apiKey: string;

	// Mailgun Domain Name
	public domain: string;

	// Mailgun Options
	public options: Partial<DeprecatedMailgunOptions> = {};

	// Mailgun list name
	public list?: string;

	// Templates
	public templates: Record<string, MailgunTemplate> = {};

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

	// Mailgun core object
	protected mailgun: Client;

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

		// Mailgun options
		const options = MailgunTransition.options(this.options, this);

		// Initialize Mailgun
		this.mailgun = mailgun.client(options);

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
		this.list = list;

		return this;
	}

	/**
	 * Send a message
	 * @param to string | string[] Email Address to send message to
	 * @param subject string Message subject
	 * @param body string Message body
	 * @param templateVars Object Template variables to send
	 * @param sendOptions Object Additional message options to send
	 */
	public async send(
		to: string | string[],
		subject: string,
		body?: string,
		templateVars = {},
		sendOptions: any = {}
	): Promise<any> {
		// Check mailgun
		if (!this.mailgun) {
			throw new Error(
				'Please call NodeMailgun::init() before sending a message!'
			);
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
		let message: any = {
			from: `${this.fromTitle} <${this.fromEmail}>`,
			to: to,
			subject: subject,
			html: body
		};

		if (templateVars && Object.keys(templateVars).length) {
			message['recipient-variables'] = JSON.stringify(templateVars);
		}

		message = Object.assign(message, sendOptions);

		if (!body || sendOptions?.template) {
			delete message.html;
		}

		// Send email
		message = MailgunTransition.message(message);

		if (message?.attachment?.data && message.attachment.data instanceof Promise) {
			message.attachment.data = await message.attachment.data;
		}

		if (this.testMode) {
			this.testModeLogger(this.domain, message, null);
			return Promise.resolve(true);
		}
		else {
			return this.mailgun.messages.create(this.domain, message);
		}
	}

	/**
	 * Send a message from a template
	 * @param to string | string[] Email Address to send message to
	 * @param subject string Message subject
	 * @param body string Message body
	 * @param templateVars Object Template variables to send
	 * @param sendOptions Object Additional message options to send
	 */
	public async sendFromTemplate(
		to: string | string[],
		template: MailgunTemplate,
		templateVars = {},
		sendOptions = {}
	): Promise<any> {
		let subject, body;

		const subjectCompiler = Handlebars.compile(template.subject);
		const bodyCompiler = Handlebars.compile(template.body);

		let allVars = {};
		allVars = Object.assign(allVars, templateVars);
		allVars = Object.assign(allVars, process.env);

		subject = subjectCompiler(allVars);
		body = bodyCompiler(allVars);

		return this.send(to, subject, body, templateVars, sendOptions);
	}

	/**
	 * Get list data of the current mailing list
	 */
	public async getList(): Promise<any> {
		return this.mailgun.lists.members.listMembers(this.list);
	}

	/**
	 * Get array of addresses in the current mailing list
	 */
	public async getListAddresses(): Promise<any> {
		const list = await this.getList();
		const addresses = [];

		for (let user of list) {
			if ('address' in user) {
				addresses.push(user.address);
			}
		}

		return addresses;

	}

	/**
	 * Add a member to the current mailing list
	 * @param address Email address to add
	 * @param name User's name
	 * @param data User data
	 */
	public async listAdd(address: string, name: string, data: any): Promise<any> {
		// Check initialization
		if (!this.mailgun || !this.list) {
			throw new Error(
				'Please call NodeMailgun::initMailingList()\
				before adding to a list.'
			);
		}

		// Create user object
		const user = {
			subscribed: true,
			address: address,
			name: name,
			vars: data
		};

		// Add user to list
		return this.mailgun.lists.members.createMember(this.list, user);
	}

	/**
	 * Update a user in the list
	 * @param address Email address to add
	 * @param data User data
	 * 		address: string,
	 * 		name: string,
	 * 		vars: Object
	 */
	public async listUpdate(address: string, data: any): Promise<any> {
		// Check initialization
		if (!this.mailgun || !this.list) {
			throw new Error(
				'Please call NodeMailgun::initMailingList()\
				before updating a list.'
			);
		}

		// Update user
		return this.mailgun.lists.members.updateMember(this.list, address, data);
	}

	/**
	 * Unsubscribe a user from the list
	 * @param address Email address to remove
	 */
	public async listRemove(address: string): Promise<any> {
		// Check initialization
		if (!this.mailgun || !this.list) {
			throw new Error(
				'Please call NodeMailgun::initMailingList()\
				before removing from a list.'
			);
		}

		// Update user
		return this.mailgun.lists.members.destroyMember(this.list, address);
	}

	/**
	 * Send to list
	 * @param newsletter Newsletter address to send to
	 * @param subject Message subject
	 * @param body Message body HTML
	 */
	public async listSend(
		newsletter: string,
		subject: string,
		body: string
	): Promise<any> {
		return this.send(newsletter, subject, body);
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
