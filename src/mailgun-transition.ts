import * as fs from 'fs';
import * as path from 'path';
import Options from 'mailgun.js/dist/lib/interfaces/Options';

import {
	Stream,
	isString,
	isArray,
	isBuffer,
	isStream,
	streamToBuffer
} from './utils';
import { NodeMailgun } from './ts-mailgun';

export type TestModeLogger = (a, b, c) => void;

export interface DeprecatedMailgunOptions {
	apiKey?: string;
	publicApiKey?: string;
	domain?: string;
	proxy?: string;
	timeout?: number;
	host?: string;
	protocol?: string;
	port?: number;
	endpoint?: string;
	testMode?: boolean;
	testModeLogger?: TestModeLogger;
}

type TranslatedAttachmentData = string | Buffer;
interface TranslatedAttachment {
	filename: string;
	data: TranslatedAttachmentData | Promise<TranslatedAttachmentData>;
}

interface AttachmentOptions {
	data: string | Buffer | Stream;
	filename?: string;
}

export class Attachment implements AttachmentOptions {
	public data: string | Buffer | Stream;
	public filename: string;

	constructor (options: AttachmentOptions) {
		this.data = options.data;
		this.filename = options.filename ? options.filename : 'file';
	}
}

/**
 * Map the old mailgun-js library options to the new
 * 	mailgun.js library (where possible)
 */
export class MailgunTransition {
	public static options(
		opts: DeprecatedMailgunOptions,
		instance: NodeMailgun
	): Options {
		if (opts.domain) {
			instance.domain = opts.domain;
		}

		if (opts.apiKey) {
			instance.apiKey = opts.apiKey;
		}

		if (opts.testMode) {
			instance.testMode = opts.testMode;
		}

		if (opts.testModeLogger) {
			instance.testModeLogger = opts.testModeLogger;
		}

		let url = undefined;

		if (opts.proxy) {
			url = opts.proxy;
		}
		else if (opts.host || opts.protocol || opts.port || opts.endpoint) {
			let url = opts.host ?
				opts.host.replace(/[a-z]+:\/\//, '') :
				'api.mailgun.net';

			const protocol = opts.protocol ? opts.protocol + '//' : 'https://';
			const port = opts.port ? ':' + opts.port : '';
			let endpoint;

			if (url.includes('/')) {
				const endpointStarts = url.indexOf('/');
				endpoint = url.substring(endpointStarts);
				url = url.substring(0, endpointStarts);
			}
			else if (opts.endpoint) {
				endpoint = opts.endpoint;
			}
			else {
				endpoint = '/v3';
			}

			url = protocol + url + port + endpoint;
		}

		return {
			username: 'api',
			key: instance.apiKey,
			public_key: opts.publicApiKey,
			url: url,
			timeout: opts.timeout
		};
	}

	public static message(message) {
		if ('attachment' in message) {
			message.attachment = this.attachment(message.attachment);
		}

		return message;
	}

	protected static attachment(attachment) {
		if (isArray(attachment)) {
			return attachment.map(this.attachment);
		}

		let handler;
		if (isString(attachment)) {
			handler = this.attachmentFilepath;
		}
		else if (attachment instanceof Attachment) {
			handler = this.attachmentObject;
		}
		else if (isBuffer(attachment)) {
			handler = this.attachmentBuffer;
		}
		else if (isStream(attachment)) {
			handler = this.attachmentStream;
		}

		return handler.bind(this)(attachment);
	}

	protected static attachmentFilepath(attachment: string): TranslatedAttachment {
		const name = path.basename(attachment);
		const data = new Promise<Buffer>((accept, reject) => {
			fs.readFile(attachment, (err, data) =>
				err ? reject(err) : accept(data)
			);
		});

		return {
			filename: name,
			data: data
		};
	}

	protected static attachmentBuffer(
		attachment: Buffer | Promise<Buffer>
	): TranslatedAttachment {
		return {
			filename: 'file',
			data: attachment
		};
	}

	protected static attachmentStream(attachment: Stream): TranslatedAttachment {
		return this.attachmentBuffer(streamToBuffer(attachment));
	}

	protected static attachmentObject(attachment: Attachment): TranslatedAttachment {
		return {
			filename: attachment.filename,
			data: this.attachment(attachment.data).data
		};
	}
}
