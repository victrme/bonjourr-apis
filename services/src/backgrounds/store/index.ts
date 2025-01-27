import { storePixabay } from './pixabay'
import { storeUnsplash } from './unsplash'
import { Env } from '../..'

export const UNSPLASH_COLLECTIONS = {
	night: 'bHDh4Ae7O8o',
	noon: 'GD4aOSg4yQE',
	day: 'o8uX55RbBPs',
	evening: '3M2rKTckZaQ',
	winter: 'u0Kne8mFCQM',
}

export async function storeCollections(url: URL, env: Env): Promise<Response> {
	const isCorrectPath = url.pathname.includes('backgrounds/collections/store')

	if (isCorrectPath) {
		const promises = [storePixabay(env), storeUnsplash(env)]

		await Promise.all(promises)

		return new Response('Done')
	}

	return new Response('Wrong path', {
		status: 400,
	})
}
