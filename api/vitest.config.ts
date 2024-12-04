import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		watch: false,
		include: ['src/index.test.ts'],
	},
})
