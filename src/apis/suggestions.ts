export default async function suggestions(req: Request, handler: Fetcher, headers: Headers) {
	const upgradeHeader = req.headers.get('Upgrade') === 'websocket'

	if (req.method === 'WS' || (req.method === 'GET' && upgradeHeader)) {
		let subRequestCount = 0
		const webSocketPair = new WebSocketPair()
		const [client, server] = Object.values(webSocketPair)

		server.accept()

		server.addEventListener(
			'message',
			debounce((ev: MessageEvent) => {
				if (subRequestCount++ === 50) {
					subRequestCount = 0
					server.send(JSON.stringify({ error: 'subrequest limit reached' }))
					server.close()
					return
				}

				try {
					const data = JSON.parse(ev.data.toString() ?? '{}')
					let queries = '?'

					if (data.q) queries += 'q=' + data.q ?? ''
					if (data.with) queries += '&with=' + data.with ?? ''
					if (data.lang) queries += '&l=' + data.lang ?? ''

					handler
						.fetch('http://127.0.0.1/' + queries)
						.then((response) => {
							response
								.json()
								.then((json) => {
									server.send(JSON.stringify(json))
								})
								.catch((err) => {
									server.send('{error: "' + err + '"}')
								})
						})
						.catch((err) => {
							server.send('{error: "' + err + '"}')
						})
				} catch (err) {
					console.error(err)
					server.send('{error: "' + err + '"}')
				}
			}, 150)
		)

		return new Response(null, {
			headers,
			status: 101,
			webSocket: client,
		})
	}

	return new Response('', { headers, status: 405 })
}

function debounce(callback: Function, delay: number) {
	let timer = setTimeout(() => {})

	return function () {
		clearTimeout(timer)

		timer = setTimeout(() => {
			callback(...arguments)
		}, delay)
	}
}
