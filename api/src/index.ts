import proxy from './proxy.ts'
import fonts from './fonts.ts'
import unsplash from './unsplash.ts'
import quotes from './quotes/src/index.ts'
import favicon from './favicon/cloudflare/index.ts'
import suggestions from './suggestions/cloudflare/index.ts'

const headers = new Headers({
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Max-Age': '3600',
})

interface Env {
	UNSPLASH?: string
}

export default {
	async fetch(req: Request, env: Env) {
		const url = new URL(req.url)
		const path = url.pathname.split('/')[1] ?? ''

		switch (path) {
			case 'unsplash':
				return await unsplash(req.url, env.UNSPLASH ?? '', headers)

			case 'proxy':
				return await proxy(req, headers)

			case 'fonts':
				return await fonts(headers)

			case 'suggestions':
				return await suggestions.fetch(req)

			case 'favicon':
				return await favicon.fetch(req)

			case 'quotes':
				return await quotes.fetch(req)

			case '': {
				headers.set('Content-Type', 'text/html')
				return new Response(LANDING_PAGE, { headers })
			}

			default:
				return new Response('Not found', {
					status: 404,
					headers,
				})
		}
	},
}

const LANDING_PAGE = `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="shortcut icon" href="https://bonjourr.fr/favicon.ico" type="image/x-icon" />

		<title>Bonjourr API - Homepage</title>

		<style>
			body {
				padding: 5vh;
				color: #3a3b3c;
			}

			button,
			body,
			a {
				font-family: system-ui, sans-serif;
			}
		</style>
	</head>
	<body>
		<p>
			This is Bonjourr API system. More information in
			<a href="https://github.com/victrme/bonjourr-apis">the source code</a>.
		</p>

		<ul>
			<li><a href="/unsplash/photos/random">/unsplash/photos/random</a></li>
			<li><a href="/weather?q=Paris,FR">/weather?q=Paris,FR</a></li>
			<li><a href="/fonts">/fonts</a></li>
			<li><a href="/favicon/https://victr.me">/favicon/https://victr.me</a></li>
			<li><a href="/quotes/classic/fr">/quotes/classic/fr</a></li>
			<li><a href="/proxy?query=https://bonjourr.fr">/proxy?query=https://bonjourr.fr</a></li>
			<li>
				<a href="/suggestions?q=minecraft&with=google&l=fr"
					>/suggestions?q=minecraft&with=google&lang=fr</a
				>
			</li>
		</ul>
	</body>
</html>
`
