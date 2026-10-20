import fs from 'fs-extra';
import path from 'path';
import copyFiles from '../helpers/copyFiles.mjs';
import paths from '../helpers/paths.mjs';
import globalVars from '../helpers/globalVars.mjs';
import logger from '../helpers/logger.mjs';

const staticAssets = ((fs, path, copyFiles, paths, globalVars, logger) => {
	const generateIconFont = () => {
		const svgDir = path.join(paths.assets, 'svg');
		if (!fs.existsSync(svgDir)) return Promise.resolve();
		const files = fs.readdirSync(svgDir)
			.filter(file => file.startsWith('ico-') && file.endsWith('.svg'))
			.map(file => path.join(svgDir, file));
		if (!files.length) return Promise.resolve();

		return import('@vusion/webfonts-generator').then(mod => {
			const generator = mod.default || mod;
			const dest = path.join(paths.assets, 'iconfont');
			fs.ensureDirSync(dest);
			return new Promise(resolve => {
				generator({
					files,
					dest,
					fontName: 'icons',
					css: true,
					cssDest: path.join(dest, 'icons.css'),
					cssFontsUrl: './',
					templateOptions: {
						classPrefix: 'font-ico-',
						baseSelector: '.icon'
					}
				}, error => {
					if (error) {
						console.warn(error); // eslint-disable-line no-console
					}
					resolve();
				});
			});
		}).catch(error => {
			console.warn(error); // eslint-disable-line no-console
		});
	};

	const writeRobots = async() => {
		const source = path.join(paths.root, 'robots.txt');
		const allow = 'User-agent: *\nAllow: /\n';
		const body = globalVars.mode === 'production' ? allow : fs.readFileSync(source, 'utf8');
		await fs.outputFile(path.join(paths.dist, 'robots.txt'), body.endsWith('\n') ? body : `${body}\n`);
	};

	const copy = async() => {
		await generateIconFont();
		await copyFiles.copyAssets();
		await copyFiles.copyFavicon();
		await writeRobots();
	};

	return { copy };
})(fs, path, copyFiles, paths, globalVars, logger);

export default staticAssets;
