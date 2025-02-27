import type { Backgrounds } from '../types/backgrounds'
import type { Env } from '..'

export async function userCollectionsOrTags(
	url: URL,
	env: Env,
	headers: Headers
): Promise<Response> {
	//
	if (url.pathname.includes('/backgrounds/user/images/unsplash')) {
		if (url.searchParams.has('collections')) {
			return unsplash('collections', url, env, headers)
		}
		if (url.searchParams.has('tags')) {
			return unsplash('tags', url, env, headers)
		}
	}

	if (url.pathname.includes('/backgrounds/user/images/pixabay')) {
		if (url.searchParams.has('tags')) {
			return await pixabay('images', url, env, headers)
		}
	}

	if (url.pathname.includes('/backgrounds/user/videos/pixabay')) {
		if (url.searchParams.has('tags')) {
			return await pixabay('videos', url, env, headers)
		}
	}

	return new Response('Wrong search params', {
		status: 400,
	})
}

async function unsplash(
	type: 'tags' | 'collections',
	url: URL,
	env: Env,
	headers: Headers
): Promise<Response> {
	headers.set('content-type', 'application/json')
	headers.set('cache-control', 'max-age=3600')

	const collections = url.searchParams.get('collections')
	const tags = url.searchParams.get('tags')
	let apiurl = 'https://api.unsplash.com/'

	if (type === 'collections') apiurl += `collections/${collections}`
	if (type === 'tags') apiurl += `/search/photos?query=${tags}&content_filter=high&per_page=20`

	const apiauth = `Client-ID ${env.UNSPLASH}`
	const apiheaders = { 'Accept-Version': 'v1', Authorization: apiauth }
	const resp = await fetch(apiurl, { headers: apiheaders })
	const json = await resp.json()

	let arr: Backgrounds.API.UnsplashImage[] = []

	switch (type) {
		case 'collections': {
			if (Array.isArray(json)) arr = json as Backgrounds.API.UnsplashImage[]
			if (!Array.isArray(json)) arr = [json as Backgrounds.API.UnsplashImage]
			break
		}

		case 'tags': {
			arr = json.results as Backgrounds.API.UnsplashImage[]
			break
		}
	}

	const result: Backgrounds.Image[] = arr.map((item) => ({
		urls: {
			full: item.urls.raw,
			medium: item.urls.regular,
			small: item.urls.small,
		},
		page: item.links.html,
		download: item.links.download,
		username: item.user.username,
		name: item.user.name,
	}))

	return new Response(JSON.stringify(result), {
		headers,
	})
}

async function pixabay(
	format: 'images' | 'videos',
	url: URL,
	env: Env,
	headers: Headers
): Promise<Response> {
	headers.set('content-type', 'application/json')
	headers.set('cache-control', 'max-age=3600')

	const typepath = format === 'videos' ? 'videos' : ''
	const key = env.PIXABAY ?? ''
	const tags = url.searchParams.get('tags')
	const orientation = url.searchParams.get('orientation') ?? 'all'

	const path = `https://pixabay.com/api/${typepath}`
	const search = `?key=${key}&q=${tags}&orientation=${orientation}&safesearch=true`
	const resp = await fetch(path + search)
	const json = await resp.json()

	switch (format) {
		case 'images': {
			const arr = json.hits as Backgrounds.API.PixabayImage[]
			const result: Backgrounds.Image[] = arr.map((item) => ({
				urls: {
					full: item.largeImageURL,
					medium: item.imageURL,
					small: item.previewURL,
				},
				page: item.pageURL,
				username: item.user,
			}))

			return new Response(JSON.stringify(result), { headers })
		}

		case 'videos': {
			const arr = json.hits as Backgrounds.API.PixabayVideo[]
			const result: Backgrounds.Video[] = arr.map((item) => ({
				page: item.pageURL,
				username: item.user,
				duration: item.duration,
				thumbnail: item.videos.large.thumbnail,
				urls: {
					full: item.videos.large.url,
					medium: item.videos.medium.url,
					small: item.videos.tiny.url,
				},
			}))

			return new Response(JSON.stringify(result), { headers })
		}
	}
}
