import { expect } from '@std/expect'

Deno.test('Says hello world', async () => {
	const response = await fetch('http://0.0.0.0:8787/')
	const text = await response.text()
	expect(text).toContain('Hello world')
})
