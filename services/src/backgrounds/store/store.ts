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
	const isCorrectPath = url.pathname.includes('backgrounds/daylight/store')

	if (!isCorrectPath) {
		return new Response('Wrong path', { status: 400 })
	}

	// 1. Check if storage is old enough to update

	// 2. Update old or empty storage

	await Promise.all([storePixabay(env), storeUnsplash(env)])

	return new Response('Done')
}
