import * as sass from 'sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import flexbugs from 'postcss-flexbugs-fixes';
import sortMediaQueries from 'postcss-sort-media-queries';
import fs from 'fs-extra';
import path from 'path';
import paths from '../helpers/paths.mjs';
import globalVars from '../helpers/globalVars.mjs';
import logger from '../helpers/logger.mjs';

const styles = ((sass, postcss, autoprefixer, flexbugs, sortMediaQueries, fs, path, paths, globalVars, logger) => {
	const compile = async() => {
		logger.startLog('scss', 'scss');
		const entry = path.join(paths.scss, 'style.scss');
		const outDir = path.join(paths.dist, 'css');
		const outFile = path.join(outDir, 'style.css');
		await fs.ensureDir(outDir);

		try {
			const compressed = globalVars.mode !== 'development';
			const result = sass.compile(entry, {
				style: compressed ? 'compressed' : 'expanded',
				loadPaths: [paths.scss],
				silenceDeprecations: ['legacy-js-api']
			});
			const processed = await postcss([
				flexbugs,
				autoprefixer(),
				sortMediaQueries()
			]).process(result.css, { from: entry, to: outFile });
			await fs.writeFile(outFile, processed.css);
			logger.finishLog('scss');
		} catch (error) {
			globalVars.buildHasError = true;
			console.error(error); // eslint-disable-line no-console
			logger.errorLog('scss', error.message || 'SCSS failed');
		}
	};

	return { compile };
})(sass, postcss, autoprefixer, flexbugs, sortMediaQueries, fs, path, paths, globalVars, logger);

export default styles;
