'use strict';

const { enter, exit } = require('./logger');

function greet(name) {
	const functionName = 'greet';
	enter(functionName, { name });

	const message = `Hello, ${name}!`;

	exit(functionName, message);
	return message;
}

module.exports = greet;