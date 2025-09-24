import { pixabayMetadataStore } from './store-pixabay.ts'
import { storeCollection } from '../shared.ts'

import type { CollectionList } from '../shared.ts'
import type { Video } from '../../../../types/backgrounds.ts'
import type { Env } from '../../../index.ts'

export async function storeDaylightVideos(env: Env, headers: Headers): Promise<Response> {
	const result: Record<string, Video[]> = {
		'bonjourr-videos-daylight-night': [],
		'bonjourr-videos-daylight-noon': [],
		'bonjourr-videos-daylight-day': [],
		'bonjourr-videos-daylight-evening': [],
	}
	const names = Object.keys(result)

	// 1. Get videos from different providers (for now pixabay only)

	const pixabayVideoCollections: CollectionList = await pixabayMetadataStore(env)

	for (const [name, medias] of Object.entries(pixabayVideoCollections)) {
		const wrongName = names.includes(name) === false
		const notVideos = medias.some((media) => media.format !== 'video')

		if (wrongName) {
			console.error(`Collection ${name} is not valid`)
			continue
		}
		if (notVideos) {
			console.error(`Medias are not videos`)
			continue
		}

		result[name].push(...medias as Video[])
	}

	// 2. Store collection to SQL database

	for (const [name, videos] of Object.entries(result)) {
		await storeCollection(env, name, videos)
	}

	// 3. Return stored medias

	headers.set('content-type', 'application/json')

	return new Response(JSON.stringify(result), { headers })
}
