import { unsplashMetadataStore } from './store-unsplash.ts'
import { storeCollection } from '../shared.ts'

import type { CollectionList } from '../shared.ts'
import type { Image } from '../../types.ts'
import type { Env } from '../../../index.ts'

export async function storeDaylightImages(env: Env, headers: Headers, isTest?: 'test'): Promise<Response> {
	const result: Record<string, Image[]> = {
		'bonjourr-images-daylight-night': [],
		'bonjourr-images-daylight-noon': [],
		'bonjourr-images-daylight-day': [],
		'bonjourr-images-daylight-evening': [],
	}

	// 1. Get medias from different providers

	const unsplashCollection: CollectionList = await unsplashMetadataStore(env, isTest)

	for (const name of Object.keys(result)) {
		if (unsplashCollection[name]) {
			result[name].push(...unsplashCollection[name] as Image[])
		}
	}

	// 2. Store collection to SQL database

	for (const [name, videos] of Object.entries(result)) {
		await storeCollection(env, name, videos)
	}

	// 3. Return stored medias

	return new Response(JSON.stringify(result), { headers })
}
