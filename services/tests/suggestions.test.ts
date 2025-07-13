import { expect } from '@std/expect'

Deno.test('has application/json as content-type', async () => {
	const response = await fetch('http://0.0.0.0:8787/suggestions?q=minecraft&with=bing')
	expect(response.headers.get('content-type')).toBe('application/json')
})

Deno.test('has valid type', async () => {
	// const response = await fetch('/suggestions?q=minecraft&with=bing')
	// const json = await response.json<Record<string, unknown>[]>()
	// const detailedResultIndex = json.findIndex((item) => item.image)

	// expect(typeof json[0]).toBe('string')
	// expect(typeof results[detailedResultIndex].desc).toBeString()
	// expect(typeof results[detailedResultIndex].image).toBeString()
})

Deno.test.ignore('Connects to a websocket', async () => {
	// const WS: any = (await import('vitest-websocket-mock')).default
	// const server = new WS(origin.replace('http', 'ws') + '/suggestions/')
	// const client = new WebSocket(origin.replace('http', 'ws') + '/suggestions/')

	// expect(await server.connected).toBeTruthy()
})

Deno.test.ignore('receives messges', async () => {
	// const WS: any = (await import('vitest-websocket-mock')).default
	// const server = new WS(origin.replace('http', 'ws') + '/suggestions/')
	// const client = new WebSocket(origin.replace('http', 'ws') + '/suggestions/')

	// const message = await new Promise((r) => {
	// 	server.on('message', r)
	// 	client.send(JSON.stringify({ q: 'hello', with: 'duckduckgo' }))
	// })
	// expect(message).toBe(true)
})
