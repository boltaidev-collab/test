import commonConfig from './webpack.common.mjs';

const webpackConfigDev = (() => {
	return {
		...commonConfig,
		mode: 'development',
		entry: {
			...commonConfig.entry,
			axeLinter: './src/js/axe-linter.js'
		}
	};
})();

export default webpackConfigDev;
