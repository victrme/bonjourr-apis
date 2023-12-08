import { describe, it, expect, expectTypeOf } from 'vitest'

// > wrangler dev
// > ⎔ Starting local server...
const origin = 'http://127.0.0.1:8787'

describe('Paths', function () {
	it('404 on unknown path', async function () {
		const response = await fetch(origin + '/lol')
		expect(response.status).toBe(404)
	})

	it('200 on /', async function () {
		const response = await fetch(origin + '/')
		expect(response.status).toBe(200)
	})

	it('200 on /weather', async function () {
		const response = await fetch(origin + '/weather')
		expect(response.status).toBe(200)
	})

	it('200 on /fonts', async function () {
		const response = await fetch(origin + '/fonts')
		expect(response.status).toBe(200)
	})

	it('200 on /favicon', async function () {
		const response = await fetch(origin + '/favicon')
		expect(response.status).toBe(200)
	})

	it('200 on /suggestions', async function () {
		const response = await fetch(origin + '/suggestions')
		expect(response.status).toBe(200)
	})

	it('200 on /quotes', async function () {
		const response = await fetch(origin + '/quotes')
		expect(response.status).toBe(200)
	})

	it('403 on /unsplash (restricted)', async function () {
		const response = await fetch(origin + '/unsplash')
		expect(response.status).toBe(403)
	})

	it('200 on /unsplash/photos/random', async function () {
		const response = await fetch(origin + '/unsplash/photos/random')
		expect(response.status).toBe(200)
	})
})

describe('Homepage', async function () {
	const response = await fetch(origin)

	it('has text/html as content-type', async function () {
		expect(response.headers.get('content-type')).toBe('text/html')
	})

	it('is an HTML page', async function () {
		const text = await response.text()
		expect(text.includes('<html lang="en">')).toBe(true)
		expect(text.length).toBeGreaterThan(2000)
	})
})

describe('Unsplash', async function () {
	const response = await fetch(origin + '/unsplash/photos/random?collections=GD4aOSg4yQE&count=8')
	const json = (await response.json()) as any

	it('returns correct amount of images', function () {
		expect(json.length).toBe(8)
	})

	it('has correct fields', function () {
		const { color, urls, links, exif, user } = json[0]
		const exifkeys = ['make', 'model', 'exposure_time', 'aperture', 'focal_length', 'iso']
		expectTypeOf(color).toBeString()
		expectTypeOf(urls.raw).toBeString()
		expectTypeOf(links.html).toBeString()
		expectTypeOf(user.username).toBeString()
		expectTypeOf(user.name).toBeString()
		expect(exifkeys.every((key) => key in exif)).toBe(true)
	})
})

describe('Weather', async function () {
	it('returns 404 on wrong path', async function () {
		const response = await fetch(origin + '/weather/lol')
		expect(response.status).toBe(404)
	})

	it('returns 400 on wrong queries', async function () {
		const response = await fetch(origin + '/weather/?lol=test')
		expect(response.status).toBe(400)
	})

	const response = await fetch(origin + '/weather')

	it('has correct headers', async function () {
		expect(response.headers.get('content-type')).toBe('application/json')
		expect(response.headers.get('cache-control')).toBe('public, max-age=1800')
	})

	it('has correct fields', async function () {
		const json = (await response.json()) as any
		const { city, ccode, lat, lon, current, hourly } = json

		expectTypeOf(city).toBeString()
		expectTypeOf(ccode).toBeString()
		expectTypeOf(lat).toBeString()
		expectTypeOf(lon).toBeString()
		expectTypeOf(current).toBeObject()
		expectTypeOf(hourly).toBeObject()
	})
})

describe('Favicon', function () {
	it("gets victr.me's favicon", async function () {
		const response = await fetch(origin + '/favicon/https://victr.me')
		expect(response.status).toBe(200)
		expect(await response.text()).toBe('https://victr.me/apple-touch-icon.png')
	})

	it('returns datauri with unknown url', async function () {
		const response = await fetch(origin + '/favicon/fsldkhfouisdhgouisd')
		expect(response.status).toBe(200)

		const favicon = await response.text()
		expect(favicon.startsWith('data:image/svg+xml')).toBe(true)
	})

	it('returns nothing when no url specified', async function () {
		const response = await fetch(origin + '/favicon/')
		expect(response.status).toBe(200)

		const favicon = await response.text()
		expect(favicon).toBe('')
	})
})

describe('Quotes', async function () {
	const response = await fetch(origin + '/quotes/')

	it('has application/json as content-type', async function () {
		expect(response.headers.get('content-type')).toBe('application/json')
	})

	it('returns classic when no other paths are specified', async function () {
		expect(response.status).toBe(200)
		expect(await response.json()).toBeTruthy()
	})

	describe('Classic', async function () {
		const response = await fetch(origin + '/quotes/classic')
		const quotes = (await response.json()) as any

		it('gives 20 quotes by default', function () {
			expect(quotes.length).toBe(20)
		})

		it('has valid type', function () {
			expectTypeOf(quotes[0].author).toBeString()
			expectTypeOf(quotes[0].content).toBeString()
		})

		it('returns quotes with lang endpoint', async function () {
			const response = await fetch(origin + '/quotes/classic/fr')
			const quotes = (await response.json()) as any
			expectTypeOf(quotes[0].author).toBeString()
			expectTypeOf(quotes[0].content).toBeString()
		})
	})

	describe('Kaamelott', async function () {
		const response = await fetch(origin + '/quotes/kaamelott')
		const quotes = (await response.json()) as any

		it('gives 20 quotes by default', function () {
			expect(quotes.length).toBe(20)
		})

		it('has valid type', function () {
			expectTypeOf(quotes[0].author).toBeString()
			expectTypeOf(quotes[0].content).toBeString()
		})
	})

	describe('Inspirobot', async function () {
		const response = await fetch(origin + '/quotes/inspirobot')
		const quotes = (await response.json()) as any

		it('gives at least 10 quotes', function () {
			expect(quotes.length).toBeGreaterThan(10)
		})

		it('has valid type', function () {
			expectTypeOf(quotes[0].author).toBeString()
			expectTypeOf(quotes[0].content).toBeString()
		})
	})
})

describe('Suggestions', function () {
	describe('GET request', async function () {
		const response = await fetch(origin + '/suggestions?q=minecraft&with=google')

		it('has application/json as content-type', function () {
			expect(response.headers.get('content-type')).toBe('application/json')
		})

		const results = (await response?.json()) as any[]
		const detailedResultIndex = results.findIndex((item) => item.image)

		it('has valid type', async function () {
			expectTypeOf(results[0].text).toBeString()
			expectTypeOf(results[detailedResultIndex].desc).toBeString()
			expectTypeOf(results[detailedResultIndex].image).toBeString()
		})
	})

	// describe('WS request', async function () {
	// 	const WS = (await import('vitest-websocket-mock')).default
	// 	const server = new WS(origin.replace('http', 'ws') + '/suggestions/')
	// 	const client = new WebSocket(origin.replace('http', 'ws') + '/suggestions/')

	// 	it('connects to a websocket', async function () {
	// 		expect(await server.connected).toBeTruthy()
	// 	})

	// 	it('receives messges', async function () {
	// 		const message = await new Promise((r) => {
	// 			server.on('message', r)
	// 			client.send(JSON.stringify({ q: 'hello', with: 'duckduckgo' }))
	// 		})

	// 		expect(message).toBe(true)
	// 	})
	// })
})

describe('Fonts', async function () {
	const response = await fetch(origin + '/fonts')

	it('has application/json as content-type', function () {
		expect(response.headers.get('content-type')).toBe('application/json')
	})

	const fontlist = (await response?.json()) as any[]

	it('has valid type', async function () {
		expectTypeOf(fontlist[0].family).toBeString()
		expectTypeOf(fontlist[0].subsets).toBeArray()
		expectTypeOf(fontlist[0].weights).toBeArray()
		expectTypeOf(fontlist[0].variable).toBeBoolean()
	})

	it('have all "latin" subset', async function () {
		expect(fontlist.every((font) => font.subsets.includes('latin'))).toBe(true)
	})

	it('have at least "400" weight', async function () {
		expect(fontlist.every((font) => font.weights.includes(400))).toBe(true)
	})
})
