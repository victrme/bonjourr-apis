export default async function proxy(req: Request, headers: Headers): Promise<Response> {
	if (req.method !== 'POST') {
		return new Response(undefined, {
			status: 405,
		})
	}

	try {
		const body = await req.text()
		const query = new URL(body)
		const resp = await fetch(query)
		const text = await resp.text()

		headers.set('content-type', 'text/plain')
		headers.set('cache-control', 'max-age=10')

		return new Response(text, { headers })
	} catch (_) {
		return new Response(undefined, {
			status: 500,
		})
	}
}
