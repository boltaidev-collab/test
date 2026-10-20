import colors from './colors.mjs';

const logger = (colors => {
	const ids = {};
	const startLog = (id, input) => {
		const date = new Date();
		ids[id] = { time: date.getTime(), label: input };
		return console.log(`[${colors.grey(date.toLocaleTimeString())}] Starting '${colors.cyan(input)}'...`); // eslint-disable-line no-console
	};
	const finishLog = id => {
		const date = new Date();
		const now = date.getTime();
		const duration = `${(now - ids[id].time) / 1000}s`;
		return console.log(`[${colors.grey(date.toLocaleTimeString())}] Finished '${colors.cyan(ids[id].label)}'${duration ? ` after ${colors.magenta(duration)}` : '.'}`); // eslint-disable-line no-console
	};

	const errorLog = (id, msg) => {
		const date = new Date();
		const now = date.getTime();
		const duration = `${(now - ids[id].time) / 1000}s`;
		const errorMsg = msg ? `ERROR!: ${colors.red(msg)}` : '';
		return console.error(`[${colors.grey(date.toLocaleTimeString())}] '${colors.cyan(ids[id].label)}' ${colors.red('errored')}${duration ? ` ${colors.red('after')} ${duration.magenta}` : '.'}${errorMsg}`); // eslint-disable-line no-console
	};

	const infoLog = (msg, color = colors.orange) => {
		return console.log(color(msg)); // eslint-disable-line no-console
	};

	return {
		startLog,
		finishLog,
		errorLog,
		infoLog,
	};
})(colors);

export default logger;
