import { Stream } from 'stream';
export { Stream };

export function isString(a) {
	return typeof a === 'string';
}

export function isBuffer(a) {
	return Buffer.isBuffer(a);
}

export function isStream(a) {
	return a instanceof Stream;
}

export function isArray(a) {
	return Array.isArray(a);
}

export async function streamToBuffer(stream: Stream): Promise<Buffer> {
	return new Promise <Buffer>((resolve, reject) => {
		const _buf = [];

		stream.on("data", chunk => _buf.push(chunk));
		stream.on("end", () => resolve(Buffer.concat(_buf)));
		stream.on("error", err => reject(`Error converting stream - ${err}`));
	});
}
