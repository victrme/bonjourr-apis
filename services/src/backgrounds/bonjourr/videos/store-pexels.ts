import { pexelsToGeneric } from '../../pexels/convert.ts'

import type { PexelsCollection } from '../../pexels/types.ts'
import type { CollectionList } from '../shared.ts'
import type { Video } from '../../types.ts'
import type { Env } from '../../../index.ts'

export const PEXELS_COLLECTIONS = {
	'bonjourr-videos-daylight-night': 'ohpcuko',
	'bonjourr-videos-daylight-noon': 'mri42tl',
	'bonjourr-videos-daylight-day': 'zcxjbgh',
	'bonjourr-videos-daylight-evening': 'emh7vgv',
}

export async function pexelsMetadataStore(env: Env): Promise<CollectionList> {
	const baseUrl = 'https://api.pexels.com/v1/collections/'
	const headers = { 'Authorization': env.PEXELS ?? '' }
	const collectionList: CollectionList = {}

	for (const [bonjourr, pexels] of Object.entries(PEXELS_COLLECTIONS)) {
		const resp = await fetch(baseUrl + pexels, { headers })
		const json = await resp.json<PexelsCollection>()
		const collection: Video[] = []

		for (const video of json.media) {
			collection.push(pexelsToGeneric(video))
		}

		collectionList[bonjourr] = collection
	}

	return collectionList
}
