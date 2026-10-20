
import commonConfig from './webpack.common.mjs';

const webpackConfigProd = (() => {
	return {
		...commonConfig,
		mode: 'production',
	};
})();

export default webpackConfigProd;
