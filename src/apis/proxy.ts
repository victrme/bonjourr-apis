export default async function proxy(req: Request): Promise<Response> {
	const reqUrl = new URL(req.url)
	const query = reqUrl.searchParams.get('query') ?? ''

	try {
		const queryUrl = new URL(query)
		const resp = await fetch(queryUrl)
		const text = await resp.text()
		return new Response(text, {
			headers: {
				'content-type': 'text/plain',
				'cache-control': 'max-age=10, immutable',
			},
		})
	} catch (_) {
		return new Response(undefined, {
			status: 500,
		})
	}
}
