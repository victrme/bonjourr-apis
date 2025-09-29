import { getCollection } from '../shared.ts'

import type { Image } from '../../types.ts'
import type { Env } from '../../../index.ts'
import { addUnsplashCropToImage } from '../../unsplash/shared.ts'

export async function getDaylightImages(env: Env, headers: Headers): Promise<Response> {
	const result: Record<string, Image[]> = {
		'bonjourr-images-daylight-night': [],
		'bonjourr-images-daylight-noon': [],
		'bonjourr-images-daylight-day': [],
		'bonjourr-images-daylight-evening': [],
	}

	for (const collection of Object.keys(result)) {
		const images = await getCollection<Image>(collection, env)

		for (let image of images) {
			if (image.urls.full.includes('unsplash')) {
				image = addUnsplashCropToImage(image)
			}

			result[collection].push(image)
		}
	}

	return new Response(JSON.stringify(result), { headers })
}
