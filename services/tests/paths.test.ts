import { expect } from '@std/expect'

Deno.test('404 on unknown path', async () => {
	const response = await fetch('http://0.0.0.0:8787/lol')
	await response.text() // Consume response to avoid "error: Leaks detected"
	expect(response.status).toBe(404)
})

Deno.test('200 on /', async () => {
	const response = await fetch('http://0.0.0.0:8787/')
	await response.text() // Consume response to avoid "error: Leaks detected"
	expect(response.status).toBe(200)
})

Deno.test('200 on /fonts', async () => {
	const response = await fetch('http://0.0.0.0:8787/fonts')
	await response.text() // Consume response to avoid "error: Leaks detected"
	expect(response.status).toBe(200)
})

Deno.test('400 on /favicon', async () => {
	const response = await fetch('http://0.0.0.0:8787/favicon/http://localhost:8787')
	await response.text() // Consume response to avoid "error: Leaks detected"
	expect(response.status).toBe(404)
})

Deno.test('200 on /favicon/text', async () => {
	const response = await fetch('http://0.0.0.0:8787/favicon/text/http://localhost:8787')
	await response.text() // Consume response to avoid "error: Leaks detected"
	expect(response.status).toBe(200)
})

Deno.test('200 on /favicon/blob', async () => {
	const response = await fetch('http://0.0.0.0:8787/favicon/blob/http://localhost:8787')
	await response.text() // Consume response to avoid "error: Leaks detected"
	expect(response.status).toBe(200)
})

Deno.test('200 on /suggestions', async () => {
	const response = await fetch('http://0.0.0.0:8787/suggestions')
	await response.text() // Consume response to avoid "error: Leaks detected"
	expect(response.status).toBe(200)
})

Deno.test('200 on /quotes', async () => {
	const response = await fetch('http://0.0.0.0:8787/quotes')
	await response.text() // Consume response to avoid "error: Leaks detected"
	expect(response.status).toBe(200)
})

Deno.test('403 on /unsplash (restricted)', async () => {
	const response = await fetch('http://0.0.0.0:8787/unsplash')
	await response.text() // Consume response to avoid "error: Leaks detected"
	expect(response.status).toBe(403)
})

Deno.test('200 on /unsplash/photos/random', async () => {
	const response = await fetch('http://0.0.0.0:8787/unsplash/photos/random')
	await response.text() // Consume response to avoid "error: Leaks detected"
	expect(response.status).toBe(200)
})
