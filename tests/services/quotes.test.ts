import { expect } from '@std/expect'
import type { Quote } from '../../services/src/quotes/src/index.ts'

let quotes: Quote[]
let response: Response

Deno.test('has application/json as content-type', async () => {
	const response = await fetch('http://0.0.0.0:8787/quotes/classic')
	expect(response.headers.get('content-type')).toBe('application/json')
})

Deno.test('returns classic when no other paths are specified', async () => {
	const response = await fetch('http://0.0.0.0:8787/quotes')
	expect(response.status).toBe(200)
	expect(await response.json()).toBeTruthy()
})

Deno.test('Classic', async (test) => {
	response = await fetch('http://0.0.0.0:8787/quotes/classic')
	quotes = (await response?.json()) as Quote[]

	await test.step('gives 20 quotes by default', () => {
		expect(quotes.length).toBe(20)
	})

	await test.step('has valid type', () => {
		expect(typeof quotes[0].author).toBe('string')
		expect(typeof quotes[0].content).toBe('string')
	})

	await test.step('returns quotes with lang endpoint', async () => {
		const response = await fetch('http://0.0.0.0:8787/quotes/classic/fr')
		const quotes = (await response.json()) as Quote[]
		expect(typeof quotes[0].author).toBe('string')
		expect(typeof quotes[0].content).toBe('string')
	})
})

Deno.test('Kaamelott', async (test) => {
	response = await fetch('http://0.0.0.0:8787/quotes/kaamelott')
	quotes = (await response?.json()) as Quote[]

	await test.step('gives 20 quotes by default', () => {
		expect(quotes.length).toBe(20)
	})

	await test.step('has valid type', () => {
		expect(typeof quotes[0].author).toBe('string')
		expect(typeof quotes[0].content).toBe('string')
	})
})

Deno.test('Inspirobot', async (test) => {
	response = await fetch('http://0.0.0.0:8787/quotes/inspirobot')
	quotes = (await response?.json()) as Quote[]

	await test.step('gives 20 quotes', () => {
		expect(quotes.length).toBe(20)
	})

	await test.step('has valid type', () => {
		expect(typeof quotes[0].author).toBe('string')
		expect(typeof quotes[0].content).toBe('string')
	})
})
