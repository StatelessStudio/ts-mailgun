// Source mapping
if (!process[Symbol.for('ts-node.register.instance')]) {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	require('source-map-support').install({
		environment: 'node'
	});
}

// Stack traces
Error.stackTraceLimit = Infinity;
const nativePrepareStackTrace = Error.prepareStackTrace;
Error.prepareStackTrace = (err, traces) => {
	return nativePrepareStackTrace(err, traces)
		.split('\n')
		.filter(line => {
			return (
				line &&
				!line.includes('node_modules') &&
				!line.includes('internal/process/')
			);
		})
		.join('\n');
};

export { NodeMailgun } from './ts-mailgun';
export { Attachment } from './mailgun-transition';
