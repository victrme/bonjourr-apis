export async function proxy(req: Request, headers: Headers): Promise<Response> {
	if (req.method !== "POST") {
		return new Response(undefined, {
			status: 405,
		})
	}

	try {
		const body = await req.text()
		const query = new URL(body)
		const resp = await fetch(query)
		const text = await resp.text()

		headers.set("content-type", "text/plain")
		headers.set("cache-control", "max-age=10")

		return new Response(text, { headers })
	} catch (_) {
		return new Response(undefined, {
			status: 500,
		})
	}
}

export async function backgroundsProxy(url: URL, headers: Headers): Promise<Response> {
	const query = url.pathname.replace("/backgrounds/proxy/", "")
	const resp = await fetch(query)
	const contenttype = resp.headers.get("Content-Type") || "default"
	const isImage = contenttype.includes("image/")

	if (resp.status !== 200) {
		return new Response(undefined, { status: resp.status })
	}
	if (!isImage) {
		throw new Error(`Requested resource is of type ${contenttype}`)
	}

	headers.set("content-type", contenttype)
	headers.set("cache-control", "max-age=3600")

	return new Response(resp.body, { headers })
}
