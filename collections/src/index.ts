import { getPixabay, storePixabay } from './pixabay'

export interface PixabayCollection {
	name: string
	ids: string[]
	type: 'film' | 'photo'
}

export interface Env {
	PIXABAY_COLLECTIONS?: string
	UNSPLASH_KEY?: string
	PIXABAY_KEY?: string
	UNSPLASH_KV?: any
	PIXABAY_KV?: any
}

export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		const url = new URL(req.url)

		if (url.pathname.includes('/store/pixabay')) {
			return await storePixabay(env)
		}

		if (url.pathname.includes('/get/pixabay')) {
			return await getPixabay(url, env)
		}

		return new Response('hello world')
	},
}
