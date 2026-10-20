import * as modules from './modules/registry.js';

const boot = () => {
	document.documentElement.classList.add('js');
	document.querySelectorAll('[data-script]').forEach(node => {
		node.getAttribute('data-script').split(/\s+/).forEach(name => {
			const fn = modules[name];
			if (typeof fn === 'function') fn(node);
		});
	});
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', boot);
} else {
	boot();
}
