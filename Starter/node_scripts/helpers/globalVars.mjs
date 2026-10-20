import fs from 'fs-extra';
import colors from './colors.mjs';

const globalVars = ((fs, colors) => {
	const nodeVersion = process.env.npm_package_engines_node || '>=24.13.0';
	const currentVersion = process.version.replace('v', '');
	const parseVersion = value => String(value)
		.replace(/^[^\d]*/, '')
		.split('.')
		.map(part => parseInt(part, 10) || 0);
	const isAtLeast = (current, required) => {
		const cur = parseVersion(current);
		const req = parseVersion(required);
		for (let index = 0; index < 3; index += 1) {
			if (cur[index] !== req[index]) return cur[index] > req[index];
		}
		return true;
	};
	const isCorrectNodeVersion = isAtLeast(currentVersion, nodeVersion);
	const buildHasError = false;
	const userConfig = JSON.parse(fs.readFileSync('./config.json'));
	const reegExp = new RegExp('@{str}', 'g');

	const logMSG = (template, arg) => {
		fs.readFile(template, 'utf8', (err, data) => {
			if (err) {
				console.error(`${colors.red('ERROR: ')}`, err); // eslint-disable-line no-console
			} else {
				data = data.replace(reegExp, arg);
				console.log(data); // eslint-disable-line no-console
			}
		});
	};

	return {
		...userConfig,
		isCorrectNodeVersion,
		buildHasError,
		logMSG
	};

})(fs, colors);

export default globalVars;
