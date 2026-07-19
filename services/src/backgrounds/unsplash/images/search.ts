import { addUnsplashCropToImage, fetchRandomUnsplash } from '../shared.ts'
import { unsplashToGeneric } from '../convert.ts'

import type { UnsplashImage } from '../types.ts'
import type { Image } from '../../types.ts'

export async function unsplashImagesSearch(url: URL, headers: Headers): Promise<Response> {
	// this whole thing probably should be reworked with URLSearchParams() but my bravery has limits
	const orientationFromUrl = url.searchParams.get('orientation')

	let orientation = ''
	if (orientationFromUrl !== "any") {
		orientation = '&orientation=' + (orientationFromUrl ?? 'landscape')
	}

	const query = url.searchParams.get('query') ?? ''
	const w = url.searchParams.get('w') ?? '1920'
	const h = url.searchParams.get('h') ?? '1080'

	const searchQuery = `?query=${query}${orientation}&content_filter=high&count=20`
	const images: UnsplashImage[] = await fetchRandomUnsplash(searchQuery)
	const result: Image[] = []

	for (const image of images) {
		const generic = unsplashToGeneric(image)
		const cropped = addUnsplashCropToImage(generic, w, h)
		result.push(cropped)
	}

	return new Response(JSON.stringify({ 'unsplash-images-search': result }), {
		headers,
	})
}
