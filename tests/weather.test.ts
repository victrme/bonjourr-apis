import { it, expect, expectTypeOf, beforeAll, afterAll, describe } from 'vitest'
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

it('200 on /', async function () {
	const response = await worker.fetch('/')
	expect(response.status).toBe(200)
})

it('has correct headers', async function () {
	response = await worker.fetch('/?provider=auto')
	expect(response.headers.get('content-type')).toBe('application/json')
	expect(response.headers.get('cache-control')).toContain('max-age')
})

it('returns weather without query', async function () {
	response = await worker.fetch('/?provider=auto')
	const json = (await response.json()) as any

	expect(typeof json.now.temp).toBe('number')
	expect(typeof json.sun.rise[0]).toBe('number')
	expect(typeof json.daily[0].high).toBe('number')
})

describe('Geolocation', function () {
	it('fails without query', async function () {
		response = await worker.fetch('/?provider=auto&geo=true')
		expect(response.status).not.toBe(200)
	})

	it('returns locations', async function () {
		response = await worker.fetch('/?provider=auto&geo=true&query=Paris')
		expect(response.status).toBe(200)

		const json = (await response.json()) as any
		const { name, detail } = json[1]

		expect(typeof name).toBe('string')
		expect(typeof detail).toBe('string')
	})
})
