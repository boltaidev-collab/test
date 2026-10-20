const handleNodeVersionFunc = (() => {
	const nodeVersion = process.env.npm_package_engines_node;
	const cleanedNodeVersion = nodeVersion.replace(/[>=]/g, '');
	const badNodeText = [
		'Bad node version!',
		`You need: v${cleanedNodeVersion} or higher`,
		`use NVM to switch to v${cleanedNodeVersion} or higher`,
	];

	return {
		badNodeText,
	};
})();

export default handleNodeVersionFunc;
