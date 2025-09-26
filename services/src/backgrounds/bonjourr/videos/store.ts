import { pixabayMetadataStore } from './store-pixabay.ts'
import { pexelsMetadataStore } from './store-pexels.ts'
import { storeCollection } from '../shared.ts'

import type { CollectionList } from '../shared.ts'
import type { Video } from '../../types.ts'
import type { Env } from '../../../index.ts'

export async function storeDaylightVideos(env: Env, headers: Headers): Promise<Response> {
	const result: Record<string, Video[]> = {
		'bonjourr-videos-daylight-night': [],
		'bonjourr-videos-daylight-noon': [],
		'bonjourr-videos-daylight-day': [],
		'bonjourr-videos-daylight-evening': [],
	}

	// 1. Get medias from different providers

	const pexelsVideoCollections: CollectionList = await pexelsMetadataStore(env)
	const pixabayVideoCollections: CollectionList = await pixabayMetadataStore(env)

	for (const name of Object.keys(result)) {
		if (pexelsVideoCollections[name]) {
			result[name].push(...pexelsVideoCollections[name] as Video[])
		}
		if (pixabayVideoCollections[name]) {
			result[name].push(...pixabayVideoCollections[name] as Video[])
		}
	}

	// 2. Store collection to SQL database

	for (const [name, videos] of Object.entries(result)) {
		await storeCollection(env, name, videos)
	}

	// 3. Return stored medias

	return new Response(JSON.stringify(result), { headers })
}
