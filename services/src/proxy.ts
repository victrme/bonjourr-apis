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

export async function backgroundsProxy(url: URL, headers: Headers): Promise<Response> {
	const query = url.pathname.replace('/backgrounds/proxy/', '')
	const resp = await fetch(query)
	const isImage = resp.headers.get('Content-Type')?.includes('image/')

	if (resp.status !== 200) {
		return new Response(undefined, { status: resp.status })
	}
	if (!isImage) {
		throw new Error(`Requested resource is of type ${resp.type}`)
	}

	headers.set('content-type', resp.type)
	headers.set('cache-control', 'max-age=3600')

	return new Response(resp.body, { headers })
}
