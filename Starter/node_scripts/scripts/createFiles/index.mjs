import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import globalVars from '../../helpers/globalVars.mjs';
import paths from '../../helpers/paths.mjs';
import colors from '../../helpers/colors.mjs';

const createFiles = ((fs, path, os, globalVars, paths, colors) => {
	Array.prototype.insert = function(index, item) {
		this.splice(index, 0, item);
	};
	const directory = (arg, type) => path.join(paths.html, `/${type}s/${arg}`);
	const templatePath = path.join(paths.root, 'node_scripts/scripts/createFiles/cf-templates/');
	const getEOL = text => {
		const m = text.match(/\r\n|\n/g);
		const u = m && m.filter(a => a === '\n').length;
		const w = m && m.length - u;
		if (u === w) {
			return os.EOL; // use the OS default
		}
		return u > w ? '\n' : '\r\n';
	};

	const appendCssImport = (data, name) => {
		const eol = getEOL(data);
		const dataArray = data.split(eol);
		const index = dataArray.length;
		dataArray.insert(index, `@forward '${name}';`);
		return dataArray.join('\n');
	};

	const create = (arg, type, file, lang) => {
		let temp = `${type}-hbs-temp.txt`;
		let filename;

		// detect which file to create
		switch (file) {
			case 'scss':
				temp = `${type}-scss-temp.txt`;
				filename = `_${arg}.scss`;
				break;
			case 'json':
				temp = `${type}-json-temp.txt`;
				filename = lang ? lang + '.data.json' : 'data.json';
				break;
			default:
				filename = `${arg}.hbs`;
		}

		const isStyle = file === 'style';
		const readDir = isStyle ? path.join(paths.scss, '/modules/_index.scss') : path.join(templatePath, `${temp}`);
		let writeDir;

		if (isStyle) {
			writeDir = path.join(paths.scss, '/modules/_index.scss');
		} else if (file === 'scss') {
			writeDir = path.join(paths.scss, `modules/${filename}`);
		} else {
			writeDir = `${directory(arg, type)}/${filename}`;
		}

		fs.readFile(readDir, 'utf8', (err, data) => {
			if (err) {
				console.log('ERROR: ', err); // eslint-disable-line no-console
			} else {
				const output = isStyle ? appendCssImport(data, arg) : data.replace(new RegExp(`@{${type}}`, 'g'), arg);
				fs.writeFileSync(writeDir, output);
			}
		});
	};
	const createFile = (arg, type) => {
		// create if template or module doesn't exists
		if (!fs.existsSync(directory(arg, type))) {
			fs.mkdirSync(directory(arg, type));
			create(arg, type, 'hbs');
			if (globalVars.isMultilanguage) {
				globalVars.languages.map(l => {
					create(arg, type, 'json', l);
				});
				create(arg, type, 'json');
			} else {
				create(arg, type, 'json');
			}
			if (type === 'module' || type === 'item') {
				create(arg, type, 'scss');
				create(arg, type, 'style');
			}
			const logTemplate = path.join(templatePath, `${type}-log-temp.txt`);
			globalVars.logMSG(logTemplate, arg);
		} else {
			console.error(`${colors.red('ERROR: ')}${colors.cyan(type)} '${colors.magenta(arg)}' already exists`); // eslint-disable-line no-console
		}
	};

	return {
		createFile: (arg, type) => createFile(arg, type)
	};
})(fs, path, os, globalVars, paths, colors);

export default createFiles;
