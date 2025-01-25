import { getPixabay, storePixabay } from './pixabay'

interface Env {
	UNSPLASH_KEY?: string
	PIXABAY_KEY?: string
	UNSPLASH_KV?: any
	PIXABAY_KV?: any
}

export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		const url = new URL(req.url)

		if (url.pathname.includes('/store/pixabay')) {
			return await storePixabay(url, env)
		}

		if (url.pathname.includes('/get/pixabay')) {
			return await getPixabay(url, env)
		}

		return new Response('hello world')
	},
}
