import globals from 'globals';
import babelParser from '@babel/eslint-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

export default [...compat.extends('eslint:recommended'), {
	languageOptions: {
		globals: {
			...globals.browser,
			...globals.node,
			$: true,
			Swiper: true,
			gsap: true,
			Waypoint: true,
			AOS: true,
			Filterizr: true,
			CookieControl: true,
		},

		parser: babelParser,
		ecmaVersion: 8,
		sourceType: 'module',

		parserOptions: {
			requireConfigFile: false,
		},
	},

	rules: {
		'block-scoped-var': 'warn',
		curly: ['warn', 'multi-line'],
		'default-case': 'warn',
		eqeqeq: 'error',
		'guard-for-in': 'error',
		'linebreak-style': 'off',
		'no-console': 'warn',
		'no-eval': 'error',
		'no-multi-spaces': 'warn',
		'no-redeclare': 'error',
		'no-unused-vars': 'warn',
		'no-use-before-define': 'off',
		'no-eq-null': 'error',
		quotes: ['error', 'single'],
		semi: ['error', 'always'],

		'semi-spacing': ['warn', {
			before: false,
		}],

		'brace-style': ['error', '1tbs', {
			allowSingleLine: true,
		}],

		camelcase: 'warn',

		'comma-spacing': ['error', {
			before: false,
			after: true,
		}],

		'comma-style': ['error', 'last'],
		'computed-property-spacing': ['error', 'never'],
		'consistent-this': ['warn', '_this'],

		indent: ['warn', 'tab', {
			SwitchCase: 1,
		}],

		'key-spacing': ['warn', {
			beforeColon: false,
			afterColon: true,
		}],

		'new-cap': 'off',
		'no-bitwise': 'error',
		'no-mixed-spaces-and-tabs': 'warn',
		'no-nested-ternary': 'error',
		'no-trailing-spaces': 'warn',
		'one-var': ['error', 'never'],
		'no-var': 'error',
		'prefer-const': 'warn',
		'no-caller': 'error',
		'no-new': 'error',
		'no-undef': 'error',
		'space-before-function-paren': ['warn', 'never'],
		'object-curly-spacing': ['warn', 'always'],
		'array-bracket-spacing': ['warn', 'never'],
		'space-in-parens': ['warn', 'never'],
		'space-before-blocks': 'warn',
		'space-infix-ops': 'warn',

		'prefer-arrow-callback': ['warn', {
			allowNamedFunctions: true,
		}],

		'no-unneeded-ternary': 'warn',
		'no-unused-expressions': 'warn',

		'keyword-spacing': ['warn', {
			before: true,
			after: true,
		}],

		'no-multiple-empty-lines': ['warn', {
			max: 1,
		}],

		'arrow-parens': ['warn', 'as-needed'],

		'arrow-spacing': ['warn', {
			before: true,
			after: true,
		}],

		'eol-last': ['warn', 'always'],
	},
}];
