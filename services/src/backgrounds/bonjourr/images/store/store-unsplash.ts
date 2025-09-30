import { getUnsplashCollectionPhoto, getUnsplashPhoto, initUnsplashAuth } from '../../../unsplash/shared.ts'
import { unsplashToGeneric } from '../../../unsplash/convert.ts'

import type { CollectionList } from '../../shared.ts'
import type { UnsplashImage } from '../../../unsplash/types.ts'
import type { Image } from '../../../types.ts'
import type { Env } from '../../../../index.ts'

export const UNSPLASH_COLLECTIONS = {
	// Daylight
	'bonjourr-images-daylight-night': 'bHDh4Ae7O8o',
	'bonjourr-images-daylight-noon': 'GD4aOSg4yQE',
	'bonjourr-images-daylight-day': 'o8uX55RbBPs',
	'bonjourr-images-daylight-evening': '3M2rKTckZaQ',

	// Seasons
	// 'bonjourr-images-seasons-spring': '...',
	// 'bonjourr-images-seasons-summer': '...',
	// 'bonjourr-images-seasons-autumn': '...',
	'bonjourr-images-seasons-winter': 'u0Kne8mFCQM',
}

export async function unsplashMetadataStore(env: Env): Promise<CollectionList> {
	const collectionList: CollectionList = {}
	const collectionListPhotoIds: Record<string, string[]> = {}

	initUnsplashAuth(env)

	// 1. Find all photo ids in wanted collections
	//  ( this loops all pages )

	for (const [_, unsplash] of Object.entries(UNSPLASH_COLLECTIONS)) {
		let isLastPage = false

		collectionListPhotoIds[unsplash] = []

		for (let page = 1; page < 100; page++) {
			if (isLastPage) {
				break
			}

			const photos: UnsplashImage[] = await getUnsplashCollectionPhoto(unsplash, page)
			const ids = photos.map((photo) => photo.id)

			collectionListPhotoIds[unsplash].push(...ids)
			isLastPage = env.TESTING ? true : ids.length !== 30
		}
	}

	// 2. Add all photos to specified collections

	for (const [bonjourr, unsplash] of Object.entries(UNSPLASH_COLLECTIONS)) {
		collectionList[bonjourr] = []

		for (const id of collectionListPhotoIds[unsplash]) {
			const image: UnsplashImage = await getUnsplashPhoto(id)
			const generic: Image = unsplashToGeneric(image)
			collectionList[bonjourr].push(generic)
		}
	}

	return collectionList
}
