import { unsplashToGeneric } from '../convert.ts'
import { fetchUnsplash } from '../shared.ts'

export async function unsplashImagesSearch(url: URL, headers: Headers): Promise<Response> {
	const orientation = url.searchParams.get('orientation') ?? 'landscape'
	const query = url.searchParams.get('query') ?? ''
	const w = url.searchParams.get('w') ?? '1920'
	const h = url.searchParams.get('h') ?? '1080'

	const images = await fetchUnsplash(`?query=${query}&orientation=${orientation}&content_filter=high&count=20`)
	const result = images.map((image) => (unsplashToGeneric(image, w, h)))

	return new Response(JSON.stringify({ 'unsplash-images-search': result }), {
		headers,
	})
}

export async function unsplashImagesCollections(url: URL, headers: Headers): Promise<Response> {
	const orientation = url.searchParams.get('orientation') ?? 'landscape'
	const query = url.searchParams.get('query') ?? ''
	const w = url.searchParams.get('w') ?? '1920'
	const h = url.searchParams.get('h') ?? '1080'

	const images = await fetchUnsplash(`?collections=${query}&orientation=${orientation}&count=20`)
	const result = images.map((image) => (unsplashToGeneric(image, w, h)))

	return new Response(JSON.stringify({ 'unsplash-images-collections': result }), {
		headers,
	})
}
