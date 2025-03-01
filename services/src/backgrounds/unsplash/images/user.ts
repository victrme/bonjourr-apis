import { Backgrounds } from '../../../types/backgrounds'
import { Env } from '../../..'

export async function unsplashImagesUser(url: URL, env: Env, headers: Headers): Promise<Response> {
	const collections = url.searchParams.get('collections')
	const tags = url.searchParams.get('tags')
	const type = !!collections ? 'collections' : !!tags ? 'tags' : undefined

	let apiurl = 'https://api.unsplash.com/'

	if (type === undefined) {
		throw new Error('No collections or tags')
	}
	if (type === 'collections') {
		apiurl += `collections/${collections}`
	}
	if (type === 'tags') {
		apiurl += `/search/photos?query=${tags}&content_filter=high&per_page=20`
	}

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
		format: 'image',
		page: item.links.html,
		download: item.links.download,
		username: item.user.username,
		name: item.user.name,
		urls: {
			full: item.urls.raw,
			medium: item.urls.regular,
			small: item.urls.small,
		},
	}))

	return new Response(JSON.stringify(result), {
		headers,
	})
}
