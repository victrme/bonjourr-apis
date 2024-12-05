export default async function proxy(req: Request, headers: Headers): Promise<Response> {
	const reqUrl = new URL(req.url)
	const query = reqUrl.searchParams.get('query') ?? ''

	try {
		const queryUrl = new URL(query)
		const resp = await fetch(queryUrl)
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
