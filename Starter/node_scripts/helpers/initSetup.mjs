import fs from 'fs-extra';
import paths from './paths.mjs';
import path from 'path';
import globalVars from './globalVars.mjs';
import logger from './logger.mjs';
import colors from './colors.mjs';
import handleNodeVersionFunc from './handleNodeVersion.mjs';

const initSetup = ((fs, paths, path, globalVars, logger, colors) => {
	const badNodeText = handleNodeVersionFunc.badNodeText;
	const handleNodeVersion = async() => {
		if (globalVars.isCorrectNodeVersion) return;
		if (!badNodeText) return;
		badNodeText.forEach(t => {
			console.log(colors.bgMagenta(t)); // eslint-disable-line no-console
		});
		process.exit(1);
	};

	const resetEnv = async env => {
		logger.startLog(env, 'reset');
		globalVars.mode = env;

		if (!fs.existsSync(paths.dist)) return;
		const itemsToDelete = await fs
			.readdir(paths.dist)
			.then(allItems =>
				allItems
					.filter(
						item =>
							!globalVars.foldersToIgnoreInDist.includes(item)
					)
					.map(item => path.join(paths.dist, item))
			);
		const promises = itemsToDelete.map(
			item =>
				new Promise((res, rej) => fs.remove(item).then(res).catch(rej))
		);

		// globalVars.cookieCivic = env === 'production' ? false : true;
		return Promise.all(promises)
			.then(() => {
				logger.finishLog(env);
			})
			.catch(() => logger.errorLog(env, 'Something went wrong!'));
	};

	const makeFolderIfMissing = inputPath => {
		if (!fs.existsSync(inputPath)) {
			fs.mkdirSync(inputPath, { recursive: true });
		}
	};

	return {
		handleNodeVersion,
		resetEnv,
		makeFolderIfMissing,
	};
})(fs, paths, path, globalVars, logger, colors);

export default initSetup;
