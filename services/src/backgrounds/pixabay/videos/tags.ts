import type { Backgrounds } from '../../../types/backgrounds'
import type { Env } from '../../..'

async function pixabayVideosTags(url: URL, env: Env, headers: Headers): Promise<Response> {
	headers.set('content-type', 'application/json')
	headers.set('cache-control', 'max-age=10')

	const key = env.PIXABAY ?? ''
	const query = url.searchParams.get('query')
	const orientation = url.searchParams.get('orientation') ?? 'all'

	const path = `https://pixabay.com/api/videos`
	const search = `?key=${key}&q=${query}&orientation=${orientation}&safesearch=true`
	const resp = await fetch(path + search)
	const json = await resp.json()

	const arr = json.hits as Backgrounds.API.PixabayVideo[]
	const result: Backgrounds.Video[] = arr.map((item) => ({
		format: 'video',
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

	return new Response(JSON.stringify({ 'pixabay-videos-user': result }), { headers })
}

export default pixabayVideosTags
