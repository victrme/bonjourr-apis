import { expect } from '@std/expect'

import type { Simple } from './meteo/src/types.ts'

Deno.test('200 on /', async () => {
	const response = await fetch('http://0.0.0.0:8888/')
	await response.text() // Consume response to avoid "error: Leaks detected"
	expect(response.status).toBe(200)
})

Deno.test('has correct headers', async () => {
	const response = await fetch('http://0.0.0.0:8888/?provider=auto')
	await response.text() // Consume response to avoid "error: Leaks detected"
	expect(response.headers.get('content-type')).toBe('application/json')
	expect(response.headers.get('cache-control')).toContain('max-age')
})

Deno.test('returns weather without query', async () => {
	const response = await fetch('http://0.0.0.0:8888/?provider=auto')
	const json = (await response.json()) as Simple.Weather

	expect(typeof json.now.temp).toBe('number')
	expect(typeof json.sun.rise[0]).toBe('number')
	expect(typeof json.daily[0].high).toBe('number')
})

Deno.test('Geolocation fails without query', async () => {
	const response = await fetch('http://0.0.0.0:8888/?provider=auto&geo=true')
	await response.text() // Consume response to avoid "error: Leaks detected"
	expect(response.status).not.toBe(200)
})

Deno.test('Geolocation returns locations', async () => {
	const response = await fetch('http://0.0.0.0:8888/?provider=auto&geo=true&query=Paris')
	expect(response.status).toBe(200)

	const json = (await response.json()) as Simple.Locations
	const { name, detail } = json[1]

	expect(typeof name).toBe('string')
	expect(typeof detail).toBe('string')
})
