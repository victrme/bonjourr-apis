export default async function proxy(req: Request): Promise<ResponseInit> {
	const reqUrl = new URL(req.url)
	const query = reqUrl.searchParams.get('query') ?? ''

	try {
		const queryUrl = new URL(query)
		return await fetch(queryUrl)
	} catch (_) {
		return new Response(undefined, {
			status: 500,
		})
	}
}
