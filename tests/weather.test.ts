import { describe, it, expect, expectTypeOf, beforeAll, afterAll } from 'vitest'
import { unstable_dev, UnstableDevWorker } from 'wrangler'

let worker: UnstableDevWorker
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

describe('Paths', function () {
	it('200 on /', async function () {
		const response = await worker.fetch('/?provider=auto')
		expect(response.status).toBe(200)
	})
})

describe('Weather', function () {
	it('has correct headers', async function () {
		response = await worker.fetch('/?provider=auto')
		expect(response.headers.get('content-type')).toBe('application/json')
		expect(response.headers.get('cache-control')).toContain('max-age')
	})

	it('has correct type', async function () {
		response = await worker.fetch('/?provider=auto')
		const json = (await response.json()) as any
		const { city, ccode, lat, lon, current, hourly } = json

		expectTypeOf(city).toBeString.result
		expectTypeOf(ccode).toBeString.result
		expectTypeOf(lat).toBeString.result
		expectTypeOf(lon).toBeString.result
		expectTypeOf(current).toBeObject.result
		expectTypeOf(hourly).toBeObject.result
	})
})
