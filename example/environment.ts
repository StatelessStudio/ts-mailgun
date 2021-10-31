import * as dotenv from 'dotenv';
const envfile = dotenv.config();

/**
 * Environment Variables Schema
 */
export class Environment {
	APP_TITLE = 'MY_APP';
}

// Export
export const env: Environment = Object.assign(
	new Environment(),
	envfile.parsed
);
