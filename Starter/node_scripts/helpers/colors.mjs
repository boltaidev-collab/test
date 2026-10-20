const colors = (() => {
	const reset = '\x1b[0m';
	const red = text => {
		return `\x1b[31m${text}${reset}`;
	};
	const orange = text => {
		return `\x1b[33m${text}${reset}`;
	};
	const grey = text => {
		return `\x1b[90m${text}${reset}`;
	};
	const cyan = text => {
		return `\x1b[36m${text}${reset}`;
	};
	const magenta = text => {
		return `\x1b[35m${text}${reset}`;
	};
	const bgMagenta = text => {
		return `\x1b[41m\x1b[30m${text}${reset}`;
	};
	return {
		red,
		orange,
		grey,
		cyan,
		magenta,
		bgMagenta
	};
})();
export default colors;
