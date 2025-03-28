import { convertToBonjourr, fetchUnsplash } from '../shared'

export async function unsplashImagesSearch(url: URL, headers: Headers): Promise<Response> {
	const query = url.searchParams.get('query') ?? ''
	const orientation = url.searchParams.get('orientation') ?? 'landscape'
	const images = await fetchUnsplash(`?query=${query}&orientation=${orientation}&content_filter=high&count=20`)
	const result = convertToBonjourr(images)

	return new Response(JSON.stringify({ 'unsplash-images-search': result }), {
		headers,
	})
}

export async function unsplashImagesCollections(url: URL, headers: Headers): Promise<Response> {
	const query = url.searchParams.get('query') ?? ''
	const orientation = url.searchParams.get('orientation') ?? 'landscape'
	const images = await fetchUnsplash(`?collections=${query}&orientation=${orientation}&count=20`)
	const result = convertToBonjourr(images)

	return new Response(JSON.stringify({ 'unsplash-images-collections': result }), {
		headers,
	})
}
