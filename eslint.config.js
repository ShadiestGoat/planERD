import js from '@eslint/js'
import ts from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
import stylistic from '@stylistic/eslint-plugin'

/** @type {import('eslint').Linter.Config[]} */
export default [
    js.configs.recommended,
    ...ts.configs.recommended,
    ...svelte.configs['flat/recommended'],
    prettier,
    ...svelte.configs['flat/prettier'],
    importPlugin.flatConfigs.recommended,
    {
        plugins: {
            '@stylistic': stylistic
        }
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        }
    },
    {
        files: ['**/*.svelte'],
        languageOptions: {
            parserOptions: {
                parser: ts.parser,
                svelteFeatures: {
                    experimentalGenerics: true
                }
            }
        }
    },
    {
        ignores: ['build/', '.svelte-kit/', 'dist/']
    },
    {
        settings: {
            'import/resolver': {
                typescript: {}
            }
        }
    },
    {
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true
                }
            ],
            '@typescript-eslint/explicit-function-return-type': [
                'error',
                {
                    allowExpressions: true
                }
            ],
            '@typescript-eslint/consistent-type-imports': [
                'warn',
                {
                    prefer: 'type-imports',
                    disallowTypeAnnotations: true,
                    fixStyle: 'separate-type-imports'
                }
            ],
            '@stylistic/semi': ['error', 'never'],
            '@stylistic/no-trailing-spaces': 'warn',
            // Fucking piece of shit >:(
            // Breaks svelte <3
            'import/no-duplicates': 'off'
        }
    }
]
