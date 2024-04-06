/** @type { import("eslint").Linter.Config } */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'plugin:prettier/recommended',
		'plugin:import/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prefer-arrow', 'prettier', 'import', 'svelte'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 'latest',
		extraFileExtensions: ['.svelte'],
		project: ['./tsconfig.json']
	},
	env: {
		browser: true,
		es2021: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	],

	settings: {
		'import/resolver': {
			node: {
				extensions: ['.js', '.ts', '.svelte']
			},
			typescript: {}
		},
		svelte: {
			version: 'detect'
		}
	}
};
