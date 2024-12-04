import weather from './weather.ts'

const headers = new Headers({
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Max-Age': '3600',
})

export default {
	async fetch(req: Request) {
		const url = new URL(req.url)
		const path = url.pathname.split('/')[1] ?? ''

		switch (path) {
			case 'weather':
				return await weather(req, headers)

			default:
				return new Response('Not found', {
					status: 404,
					headers,
				})
		}
	},
}
