import { afterAll, beforeAll, describe, expect, expectTypeOf, it } from "vitest"
import { unstable_dev, type Unstable_DevWorker } from "wrangler"

let worker: Unstable_DevWorker
let response: Awaited<ReturnType<typeof worker.fetch>>

beforeAll(async () => {
	worker = await unstable_dev("./services/src/index.ts", {
		ip: "127.0.0.1",
		port: 8787,
		experimental: {
			disableExperimentalWarning: true,
		},
	})
})

afterAll(async () => {
	await worker.stop()
})

describe("Paths", () => {
	it("404 on unknown path", async () => {
		const response = await worker.fetch("/lol")
		expect(response.status).toBe(404)
	})

	it("200 on /", async () => {
		const response = await worker.fetch("/")
		expect(response.status).toBe(200)
	})

	it("200 on /fonts", async () => {
		const response = await worker.fetch("/fonts")
		expect(response.status).toBe(200)
	})

	it("400 on /favicon", async () => {
		const response = await worker.fetch("/favicon/http://localhost:8787")
		expect(response.status).toBe(404)
	})

	it("200 on /favicon/text", async () => {
		const response = await worker.fetch("/favicon/text/http://localhost:8787")
		expect(response.status).toBe(200)
	})

	it("200 on /favicon/blob", async () => {
		const response = await worker.fetch("/favicon/blob/http://localhost:8787")
		expect(response.status).toBe(200)
	})

	it("200 on /suggestions", async () => {
		const response = await worker.fetch("/suggestions")
		expect(response.status).toBe(200)
	})

	it("200 on /quotes", async () => {
		const response = await worker.fetch("/quotes")
		expect(response.status).toBe(200)
	})

	it("403 on /unsplash (restricted)", async () => {
		const response = await worker.fetch("/unsplash")
		expect(response.status).toBe(403)
	})

	it("200 on /unsplash/photos/random", async () => {
		const response = await worker.fetch("/unsplash/photos/random")
		expect(response.status).toBe(200)
	})
})

describe("Homepage", () => {
	it("Says hello world", async () => {
		const response = await worker.fetch("/")
		const text = await response.text()
		expect(text).toContain("Hello world")
	})
})

describe("Unsplash", () => {
	let json: any

	beforeAll(async () => {
		response = await worker.fetch("/unsplash/photos/random?collections=GD4aOSg4yQE&count=8")
		json = (await response.json()) as any
	})

	it("returns correct amount of images", () => {
		expect(json.length).toBe(8)
	})

	it("has correct fields", async () => {
		const { color, urls, links, exif, user } = json[0]
		const exifkeys = ["make", "model", "exposure_time", "aperture", "focal_length", "iso"]
		expectTypeOf(color).toBeString.result
		expectTypeOf(urls.raw).toBeString.result
		expectTypeOf(links.html).toBeString.result
		expectTypeOf(user.username).toBeString.result
		expectTypeOf(user.name).toBeString.result
		expect(exifkeys.every(key => key in exif)).toBe(true)
	})
})

describe("Quotes", () => {
	let quotes: any[]

	it("has application/json as content-type", async () => {
		const response = await worker.fetch("/quotes/classic")
		expect(response.headers.get("content-type")).toBe("application/json")
	})

	it("returns classic when no other paths are specified", async () => {
		const response = await worker.fetch("/quotes")
		expect(response.status).toBe(200)
		expect(await response.json()).toBeTruthy()
	})

	describe("Classic", () => {
		beforeAll(async () => {
			response = await worker.fetch("/quotes/classic")
			quotes = (await response?.json()) as any[]
		})

		it("gives 20 quotes by default", () => {
			expect(quotes.length).toBe(20)
		})

		it("has valid type", () => {
			expectTypeOf(quotes[0].author).toBeString.result
			expectTypeOf(quotes[0].content).toBeString.result
		})

		it("returns quotes with lang endpoint", async () => {
			const response = await worker.fetch("/quotes/classic/fr")
			const quotes = (await response.json()) as any
			expectTypeOf(quotes[0].author).toBeString.result
			expectTypeOf(quotes[0].content).toBeString.result
		})
	})

	describe("Kaamelott", async () => {
		beforeAll(async () => {
			response = await worker.fetch("/quotes/kaamelott")
			quotes = (await response?.json()) as any[]
		})

		it("gives 20 quotes by default", () => {
			expect(quotes.length).toBe(20)
		})

		it("has valid type", () => {
			expectTypeOf(quotes[0].author).toBeString.result
			expectTypeOf(quotes[0].content).toBeString.result
		})
	})

	describe("Inspirobot", async () => {
		beforeAll(async () => {
			response = await worker.fetch("/quotes/inspirobot")
			quotes = (await response?.json()) as any[]
		})

		it("gives 20 quotes", () => {
			expect(quotes.length).toBe(20)
		})

		it("has valid type", () => {
			expectTypeOf(quotes[0].author).toBeString.result
			expectTypeOf(quotes[0].content).toBeString.result
		})
	})
})

describe("Suggestions", () => {
	describe("GET request", async () => {
		beforeAll(async () => {
			response = await worker.fetch("/suggestions?q=minecraft&with=bing")
		})

		it("has application/json as content-type", () => {
			expect(response.clone().headers.get("content-type")).toBe("application/json")
		})

		it("has valid type", async () => {
			const results = (await response?.clone().json()) as any[]
			const detailedResultIndex = results.findIndex(item => item.image)

			expectTypeOf(results[0].text).toBeString.result
			expectTypeOf(results[detailedResultIndex].desc).toBeString.result
			expectTypeOf(results[detailedResultIndex].image).toBeString.result
		})
	})

	describe("WS request", () => {
		// const WS: any = (await import('vitest-websocket-mock')).default
		// const server = new WS(origin.replace('http', 'ws') + '/suggestions/')
		// const client = new WebSocket(origin.replace('http', 'ws') + '/suggestions/')

		it.todo("connects to a websocket", async () => {
			// expect(await server.connected).toBeTruthy()
		})

		it.todo("receives messges", async () => {
			// const message = await new Promise((r) => {
			// 	server.on('message', r)
			// 	client.send(JSON.stringify({ q: 'hello', with: 'duckduckgo' }))
			// })
			// expect(message).toBe(true)
		})
	})
})

describe("Fonts", () => {
	let fontlist: Record<string, unknown>[]

	beforeAll(async () => {
		response = await worker.fetch("/fonts")
		fontlist = (await response?.json()) as Record<string, unknown>[]
	})

	it("has application/json as content-type", () => {
		expect(response.headers.get("content-type")).toBe("application/json")
	})

	it("has valid type", () => {
		expectTypeOf(fontlist[0].family).toBeString.result
		expectTypeOf(fontlist[0].subsets).toBeArray.result
		expectTypeOf(fontlist[0].weights).toBeArray.result
		expectTypeOf(fontlist[0].variable).toBeBoolean.result
	})

	it('have all "latin" subset', async () => {
		expect(fontlist.every(font => font.subsets.includes("latin"))).toBe(true)
	})

	it('have at least "400" weight', async () => {
		expect(fontlist.every(font => font.weights.includes(400))).toBe(true)
	})
})
