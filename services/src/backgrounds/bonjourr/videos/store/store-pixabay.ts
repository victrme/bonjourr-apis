import { pixabayVideoToGeneric } from '../../../pixabay/convert.ts'

import type { Pixabay, PixabayVideo } from '../../../pixabay/types.ts'
import type { CollectionList } from '../../shared.ts'
import type { Env } from '../../../../index.ts'

interface PixabayCollection {
	name: string
	ids: string[]
	type: 'film'
}

export async function pixabayMetadataStore(env: Env): Promise<CollectionList> {
	const result: CollectionList = {}

	// 1. Get collection ids manually fetched from website

	const resp = await fetch(env.PIXABAY_COLLECTIONS ?? '')
	const collections = await resp.json<PixabayCollection[]>()

	if (!collections || collections.length === 0) {
		throw new Error('Collections have not been found.')
	}

	// 2. Get each id its metadata using Pixabay API

	for (const collection of collections) {
		result[collection.name] = []

		// 2a. Prepare parallel fetching

		const promises = collection.ids.map(async function (id) {
			const noParams = !id || !env.PIXABAY

			if (noParams) {
				console.error('No parameters. Endpoint is "/videos/id"')
				return
			}

			const resp = await fetch(`https://pixabay.com/api/videos?key=${env.PIXABAY}&id=${id}`)
			const json = await resp.json<Pixabay>()

			if (json.hits.length === 0) {
				console.error('Found nothing')
				return
			}

			const pixabayVideo = json.hits[0] as PixabayVideo
			const video = pixabayVideoToGeneric(pixabayVideo)

			video.urls.full = `https://medias.bonjourr.fr/videos/pixabay/${id}/1440x900.webm`
			video.urls.medium = `https://medias.bonjourr.fr/videos/pixabay/${id}/160x100.webm`
			video.urls.small = `https://medias.bonjourr.fr/videos/pixabay/${id}/160x100.webm`

			return video
		})

		// 2b. Fetch from api in parallel

		const videos = await Promise.all(promises)

		for (const video of videos) {
			if (video) {
				result[collection.name].push(video)
			}
		}
	}

	return result
}
