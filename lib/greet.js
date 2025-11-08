import { enter, exit } from './logger.js';

function greet(name) {
	const functionName = 'greet';
	enter(functionName, { name });

	const message = `Hello, ${name}!`;

	exit(functionName, message);
	return message;
}

export default greet;