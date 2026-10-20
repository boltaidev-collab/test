import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import beautify from 'js-beautify';
import paths from '../helpers/paths.mjs';
import globalVars from '../helpers/globalVars.mjs';
import logger from '../helpers/logger.mjs';

const html = ((fs, path, Handlebars, beautify, paths, globalVars, logger) => {
	let helpersReady = false;

	const registerHelpers = () => {
		if (helpersReady) return;
		helpersReady = true;

		Handlebars.registerHelper('compare', (left, operator, right) => {
			switch (operator) {
				case '===': return left === right;
				case '!==': return left !== right;
				case '<': return left < right;
				case '<=': return left <= right;
				case '>': return left > right;
				case '>=': return left >= right;
				case '&&': return Boolean(left && right);
				case '||': return Boolean(left || right);
				default: return false;
			}
		});

		Handlebars.registerHelper('ifAny', function ifAny(...args) {
			const options = args.pop();
			const ok = args.some(value => Boolean(value));
			return ok ? options.fn(this) : options.inverse(this);
		});

		Handlebars.registerHelper('ifContains', function ifContains(value, ...args) {
			const options = args.pop();
			const ok = args.some(item => value === item || (typeof value === 'string' && value.includes(item)));
			return ok ? options.fn(this) : options.inverse(this);
		});
	};

	const registerPartials = type => {
		const root = path.join(paths.html, type);
		if (!fs.existsSync(root)) return;
		fs.readdirSync(root).forEach(name => {
			const file = path.join(root, name, `${name}.hbs`);
			if (fs.existsSync(file)) {
				Handlebars.registerPartial(name, fs.readFileSync(file, 'utf8'));
			}
		});
	};

	const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

	const mergeModuleData = data => {
		const merged = { ...(data || {}) };
		Object.entries(merged).forEach(([key, value]) => {
			const moduleJson = path.join(paths.html, 'modules', key, 'data.json');
			if (!fs.existsSync(moduleJson)) return;
			const base = readJson(moduleJson);
			if (value === true) {
				merged[key] = base;
			} else if (value && typeof value === 'object' && !Array.isArray(value)) {
				merged[key] = { ...base, ...value };
			}
		});
		return merged;
	};

	const compile = async() => {
		logger.startLog('html', 'html');
		registerHelpers();
		registerPartials('modules');
		registerPartials('items');

		const templatesRoot = path.join(paths.html, 'templates');
		const names = fs.readdirSync(templatesRoot).filter(name => fs.existsSync(path.join(templatesRoot, name, `${name}.hbs`)));

		try {
			await Promise.all(names.map(async name => {
				const dir = path.join(templatesRoot, name);
				const source = fs.readFileSync(path.join(dir, `${name}.hbs`), 'utf8');
				const templateData = readJson(path.join(dir, 'data.json'));
				const output = templateData.output || `${name}.html`;
				const depth = output.split('/').filter(Boolean).length - (output.endsWith('.html') ? 1 : 0);
				const assetPrefix = depth > 0 ? '../'.repeat(depth) : './';
				const context = {
					...templateData,
					data: mergeModuleData(templateData.data),
					assetPrefix,
					robots: globalVars.mode === 'production' ? 'index, follow' : 'noindex, nofollow',
					isDev: globalVars.mode === 'development',
					year: new Date().getFullYear()
				};
				const rendered = Handlebars.compile(source)(context);
				const pretty = beautify.html(rendered, {
					indent_with_tabs: true,
					end_with_newline: true,
					wrap_line_length: 0,
					preserve_newlines: false,
					extra_liners: []
				});
				await fs.outputFile(path.join(paths.dist, output), pretty);
			}));
			logger.finishLog('html');
		} catch (error) {
			globalVars.buildHasError = true;
			console.error(error); // eslint-disable-line no-console
			logger.errorLog('html', error.message || 'HTML failed');
		}
	};

	return { compile };
})(fs, path, Handlebars, beautify, paths, globalVars, logger);

export default html;
