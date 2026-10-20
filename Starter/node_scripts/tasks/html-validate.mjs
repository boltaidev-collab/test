import fs from 'fs-extra';
import path from 'path';
import { w3cHtmlValidator } from 'w3c-html-validator';
import paths from '../helpers/paths.mjs';
import logger from '../helpers/logger.mjs';

const files = [];
const walk = dir => {
	if (!fs.existsSync(dir)) return;
	fs.readdirSync(dir).forEach(entry => {
		const full = path.join(dir, entry);
		if (fs.statSync(full).isDirectory()) {
			walk(full);
		} else if (entry.endsWith('.html')) {
			files.push(full);
		}
	});
};

walk(paths.dist);
logger.startLog('html-validate', 'html-validate');

let failed = false;
for (const file of files) {
	const result = await w3cHtmlValidator.validate({ filename: file });
	if (!result.validates) {
		failed = true;
		console.error(file); // eslint-disable-line no-console
		console.error(result.messages); // eslint-disable-line no-console
	}
}

if (failed) {
	logger.errorLog('html-validate', 'Invalid HTML');
	process.exitCode = 1;
} else {
	logger.finishLog('html-validate');
}
