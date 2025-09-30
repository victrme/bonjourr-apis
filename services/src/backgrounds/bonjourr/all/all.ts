import { getAllInCollection } from '../shared.ts'
import type { Media } from '../shared.ts'
import type { Env } from '../../../index.ts'

export async function getAllStoredMedia(env: Env, headers: Headers): Promise<Response> {
	const medias: Media[] = []

	const collections: string[] = [
		'bonjourr-images-daylight-night',
		'bonjourr-images-daylight-noon',
		'bonjourr-images-daylight-day',
		'bonjourr-images-daylight-evening',
		'bonjourr-videos-daylight-night',
		'bonjourr-videos-daylight-noon',
		'bonjourr-videos-daylight-day',
		'bonjourr-videos-daylight-evening',
	]

	for (const collection of collections) {
		try {
			medias.push(...await getAllInCollection(collection, env))
		} catch (err) {
			console.log((err as Error).message)
		}
	}

	return new Response(JSON.stringify(medias), { headers })
}
