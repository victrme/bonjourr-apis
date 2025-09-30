export async function backgroundsProxy(url: URL, headers: Headers): Promise<Response> {
	const query = url.pathname.replace('/backgrounds/proxy/', '')
	const resp = await fetch(query)
	const contentType = resp.headers.get('Content-Type') || 'default'
	const sizeInMb = parseInt(resp.headers.get('Content-Length') ?? '0') / 10 ** 6

	const MAX_CONTENT_SIZE = 20

	const VALID_CONTENT_TYPES: string[] = [
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/webp',
		'image/svg+xml',
		'video/mp4',
		'video/webm',
	] as const

	if (resp.ok === false) {
		return new Response(undefined, {
			status: resp.status,
		})
	}

	if (sizeInMb > MAX_CONTENT_SIZE) {
		return new Response(`Content must be smaller than ${MAX_CONTENT_SIZE}Mb, for now.`, {
			status: 413,
		})
	}

	if (!VALID_CONTENT_TYPES.includes(contentType)) {
		throw new Error(`Requested resource is of type ${contentType}`)
	}

	headers.set('content-type', contentType)
	headers.set('cache-control', 'max-age=3600')

	return new Response(resp.body, { headers })
}
