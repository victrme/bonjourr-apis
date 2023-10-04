export default {
	async fetch(request: Request) {
		return new Response(request.url, {
			status: 200,
			headers: {
				'access-control-allow-origin': '*',
				'cache-control': 'public, maxage=3600',
			},
		})
	},
}
