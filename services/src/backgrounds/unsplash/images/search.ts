import { addUnsplashCropToImage, fetchRandomUnsplash } from '../shared.ts'
import { unsplashToGeneric } from '../convert.ts'

import type { UnsplashImage } from '../types.ts'
import type { Image } from '../../types.ts'

export async function unsplashImagesSearch(url: URL, headers: Headers): Promise<Response> {
	const orientation = url.searchParams.get('orientation') ?? 'landscape'
	const query = url.searchParams.get('query') ?? ''
	const w = url.searchParams.get('w') ?? '1920'
	const h = url.searchParams.get('h') ?? '1080'

	const searchQuery = `?query=${query}&orientation=${orientation}&content_filter=high&count=20`
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
