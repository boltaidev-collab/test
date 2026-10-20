import axe from 'axe-core';
import taskConfig from '../config/config.js';

const run = () => {
	axe.run(document, taskConfig.axe).then(results => {
		results.violations.forEach(violation => {
			console.warn(`[a11y] ${violation.id}: ${violation.help}`, violation.nodes); // eslint-disable-line no-console
		});
	}).catch(error => {
		console.warn('[a11y] axe failed', error); // eslint-disable-line no-console
	});
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', run);
} else {
	run();
}
