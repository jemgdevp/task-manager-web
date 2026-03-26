import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
  // Files to ignore
  {
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  // Recommended JavaScript config
  js.configs.recommended,

  // Vue essential flat config
  ...pluginVue.configs['flat/essential'],

  // Global language options
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Custom rules
  // Proteccion para produccion sobre los console.log y debugger
  {
    files: ['**/*.{js,mjs,jsx,vue}'],
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
      'vue/multi-word-component-names': 'off',
      // Ignorar variables no usadas que empiezan con guion bajo
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
]