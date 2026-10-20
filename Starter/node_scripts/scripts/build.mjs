import fs from 'fs-extra';
import path from 'path';
import initSetup from '../helpers/initSetup.mjs';
import globalVars from '../helpers/globalVars.mjs';
import paths from '../helpers/paths.mjs';
import logger from '../helpers/logger.mjs';
import js from './javascript.mjs';
import styles from './styles.mjs';
import html from './html.mjs';
import staticAssets from './staticAssets.mjs';

const buildProject = (async(mode, options = {}) => {
	const reset = options.reset !== false;
	await initSetup.handleNodeVersion();
	initSetup.makeFolderIfMissing(paths.dist);
	if (reset) {
		await initSetup.resetEnv(mode);
	} else {
		globalVars.mode = mode;
	}
	initSetup.makeFolderIfMissing(path.join(paths.dist, 'css'));
	initSetup.makeFolderIfMissing(path.join(paths.dist, 'js'));
	const modulesDir = path.join(paths.js, 'modules');
	const moduleFiles = fs.readdirSync(modulesDir).filter(file => file.endsWith('.js') && file !== 'registry.js');
	const registry = moduleFiles.map(file => {
		const name = file.replace(/\.js$/, '');
		return `export { ${name} } from './${name}.js';`;
	}).join('\n');
	const registryFile = path.join(modulesDir, 'registry.js');
	const registryBody = `${registry}\n`;
	const currentRegistry = fs.existsSync(registryFile) ? fs.readFileSync(registryFile, 'utf8') : '';
	if (currentRegistry !== registryBody) {
		fs.writeFileSync(registryFile, registryBody);
	}
	globalVars.buildHasError = false;

	await Promise.all([
		styles.compile(),
		js.webpack(),
		html.compile(),
		staticAssets.copy()
	]);

	if (globalVars.buildHasError) {
		logger.infoLog('Build finished with errors');
		process.exitCode = 1;
	}
});

export default buildProject;
