import path from 'path';
import globalVars from './globalVars.mjs';

const paths = ((path, globalVars) => {
	const root = process.cwd();
	return {
		root,
		assets: path.join(root, 'src/assets'),
		dist: path.join(root, globalVars.isCMSVersion ? '../wwwroot' : 'dist'),
		scss: path.join(root, 'src/scss'),
		js: path.join(root, 'src/js'),
		html: path.join(root, 'src/html')
	};
})(path, globalVars);
export default paths;
