export default {
	extends: ['stylelint-config-standard-scss'],
	ignoreFiles: ['**/node_modules/**', '**/iconfont/**'],
	rules: {
		'selector-class-pattern': null,
		'scss/dollar-variable-pattern': null,
		'scss/double-slash-comment-empty-line-before': null,
		'no-descending-specificity': null,
		'declaration-empty-line-before': null,
		'comment-empty-line-before': null,
		'custom-property-pattern': null,
		'media-feature-range-notation': null,
		'alpha-value-notation': 'number',
		'color-function-notation': 'modern',
		'font-family-name-quotes': 'always-where-recommended',
		'selector-no-vendor-prefix': null,
		'property-no-vendor-prefix': null
	}
};
