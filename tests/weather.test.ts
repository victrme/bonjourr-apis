import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { unstable_dev, type Unstable_DevWorker } from 'wrangler'
import type { Simple } from '../weather/meteo/src/types'

let worker: Unstable_DevWorker
let response: Awaited<ReturnType<typeof worker.fetch>>

beforeAll(async () => {
	worker = await unstable_dev('./weather/index.ts', {
		ip: '127.0.0.1',
		port: 8888,
		experimental: { disableExperimentalWarning: true },
	})
})

afterAll(async () => {
	await worker.stop()
})

it('200 on /', async () => {
	const response = await worker.fetch('/')
	expect(response.status).toBe(200)
})

it('has correct headers', async () => {
	response = await worker.fetch('/?provider=auto')
	expect(response.headers.get('content-type')).toBe('application/json')
	expect(response.headers.get('cache-control')).toContain('max-age')
})

it('returns weather without query', async () => {
	response = await worker.fetch('/?provider=auto')
	const json = (await response.json()) as Simple.Weather

	expect(typeof json.now.temp).toBe('number')
	expect(typeof json.sun.rise[0]).toBe('number')
	expect(typeof json.daily[0].high).toBe('number')
})

describe('Geolocation', () => {
	it('fails without query', async () => {
		response = await worker.fetch('/?provider=auto&geo=true')
		expect(response.status).not.toBe(200)
	})

	it('returns locations', async () => {
		response = await worker.fetch('/?provider=auto&geo=true&query=Paris')
		expect(response.status).toBe(200)

		const json = (await response.json()) as Simple.Locations
		const { name, detail } = json[1]

		expect(typeof name).toBe('string')
		expect(typeof detail).toBe('string')
	})
})
