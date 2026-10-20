import webpack from 'webpack';
import fs from 'fs-extra';
import path from 'path';
import webpackConfigDev from '../../webpack.dev.mjs';
import webpackConfigProd from '../../webpack.prod.mjs';
import globalVars from '../helpers/globalVars.mjs';
import logger from '../helpers/logger.mjs';
import paths from '../helpers/paths.mjs';

const js = ((webpack, fs, path, webpackConfigDev, webpackConfigProd, globalVars, logger, paths) => {
	const runWebpack = () => {
		logger.startLog('js', 'js');
		return new Promise(res => {
			const isNotDev = globalVars.mode !== 'development';
			const webpackConfig = isNotDev ? webpackConfigProd : webpackConfigDev;

			webpackConfig.output.path = path.join(paths.dist, 'js');
			webpackConfig.devtool = false;

			const compiler = webpack(webpackConfig);

			const config = {
				colors: true,
				performance: false,
				timings: false,
				excludeAssets: true,
				assets: false,
				entrypoints: false,
				modules: false,
				hash: false,
				version: false,
				builtAt: false,
			};

			compiler.run((_, stats) => {
				if (stats.hasErrors()) {
					console.log(stats.toString(config)); // eslint-disable-line no-console
					globalVars.buildHasError = true;
					logger.errorLog('js');
				} else if (stats.hasWarnings()) {
					console.log(stats.toString(config)); // eslint-disable-line no-console
					logger.finishLog('js');
				} else {
					logger.finishLog('js');
				}

				res();
			});
		});
	};

	return {
		webpack: runWebpack
	};
})(webpack, fs, path, webpackConfigDev, webpackConfigProd, globalVars, logger, paths);

export default js;
