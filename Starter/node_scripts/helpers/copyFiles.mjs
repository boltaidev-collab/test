import fs from 'fs-extra';
import paths from './paths.mjs';
import path from 'path';
import logger from './logger.mjs';

const copyFiles = ((fs, paths, path, logger) => {
	const destination = path.join(paths.dist, 'assets');
	const allImages = fs.readdirSync(`${paths.assets}/images`);
	const arrayOfFiles = allImages.map(img => path.join(`${paths.assets}/images/`, img));
	const maxFileSize = 1_000_000;

	const faviconFolder = path.join(paths.root, 'src/favicon');
	const faviconDestination = path.join(paths.dist, 'favicon');

	const checkFileSize = imgs => {
		imgs.forEach(img => {
			const fileSizeInBytes = fs.statSync(img).size;
			if (fileSizeInBytes > maxFileSize) {
				const image = path.parse(img);
				console.warn(`${image.base} is larger than 1MB, it's ${Math.round(((fileSizeInBytes / 1024 / 1024) + Number.EPSILON) * 100) / 100}MB`); // eslint-disable-line no-console
			}
		});
	};

	const copyAssets = (async() => {
		logger.startLog('assets', 'assets');
		checkFileSize(arrayOfFiles);
		return new Promise(res => {
			fs.copy(paths.assets, destination, async err => {
				if (err) {
					logger.errorLog('assets', 'An error occurred while copying the folder.');
				} else {
					logger.finishLog('assets');
				}
				res();
			});
		});
	});

	const copyFavicon = (async() => {
		logger.startLog('favicon', 'favicon');
		return new Promise(res => {
			fs.copy(faviconFolder, faviconDestination, async err => {
				if (err) {
					logger.errorLog('favicon', 'An error occurred while copying the folder.');
				} else {
					logger.finishLog('favicon');
				}
				res();
			});
		});
	});

	return {
		copyAssets,
		copyFavicon
	};

})(fs, paths, path, logger);

export default copyFiles;
