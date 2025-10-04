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
	// 'bonjourr-images-seasons-winter': 'u0Kne8mFCQM',
}

export async function unsplashMetadataStore(env: Env): Promise<CollectionList> {
	const collectionList: CollectionList = {}
	const collectionListPhotoIds: Record<string, string[]> = {}

	initUnsplashAuth(env)

	// 1. Find all photo ids in wanted collections
	//  ( this loops all pages )

	if (env.TESTING) {
		for (const name of Object.values(UNSPLASH_COLLECTIONS)) {
			const randomIndex = Math.round(Math.random() * 20)
			const photos = await getUnsplashCollectionPhoto(name)
			const photo = photos[randomIndex]
			collectionListPhotoIds[name] = [photo.id]
		}
	}

	if (env.TESTING !== true) {
		for (const name of Object.values(UNSPLASH_COLLECTIONS)) {
			collectionListPhotoIds[name] = []

			for (let page = 1; page < 100; page++) {
				const photos: UnsplashImage[] = await getUnsplashCollectionPhoto(name, page)
				const ids = photos.map((photo) => photo.id)

				collectionListPhotoIds[name].push(...ids)

				if (ids.length !== 30) {
					break
				}
			}
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
