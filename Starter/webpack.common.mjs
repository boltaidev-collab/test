import path from 'path';
import ESLintWebpackPlugin from 'eslint-webpack-plugin';
import paths from './node_scripts/helpers/paths.mjs';

const commonConfig = (() => {

	const eslintOptions = {
		fix: true,
		files: './src/js/**/*.js'
	};

	return {
		entry: {
			global: './src/js/global.js',
		},
		output: {
			path: path.join(paths.root, './dist/js/'),
			filename: '[name].min.js'
		},
		resolve: {
			alias: {
				core: path.join(paths.root, 'core'),
			}
		},
		module: {
			rules: [
				{
					test: path.join(paths.root),
					use: {
						loader: 'babel-loader',
						options: {
							presets: [
								[
									'@babel/preset-env'
								]
							]
						}
					},
					resolve: {
						fullySpecified: false,
					}
				},
			],
		},
		optimization: {
			usedExports: true
		},
		plugins: [
			new ESLintWebpackPlugin(eslintOptions),
		]
	};
})();

export default commonConfig;
