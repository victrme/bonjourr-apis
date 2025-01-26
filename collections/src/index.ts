import { getPixabay, storePixabay } from './pixabay'
import { getUnsplash, storeUnsplash } from './unsplash'

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

export const UNSPLASH_COLLECTIONS = {
	night: 'bHDh4Ae7O8o',
	noon: 'GD4aOSg4yQE',
	day: 'o8uX55RbBPs',
	evening: '3M2rKTckZaQ',
	winter: 'u0Kne8mFCQM',
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

		if (url.pathname.includes('/store/unsplash')) {
			return await storeUnsplash(env)
		}

		if (url.pathname.includes('/get/unsplash')) {
			return await getUnsplash(url, env)
		}

		return new Response('hello world')
	},
}
