import type { Pixabay, PixabayVideo, Video } from '../../../../types/backgrounds.ts'
import type { Env } from '../../../index.ts'

export async function pixabayVideosSearch(url: URL, env: Env, headers: Headers): Promise<Response> {
	headers.set('content-type', 'application/json')
	headers.set('cache-control', 'max-age=10')

	const key = env.PIXABAY ?? ''
	const query = url.searchParams.get('query')
	const orientation = url.searchParams.get('orientation') ?? 'all'

	const path = 'https://pixabay.com/api/videos'
	const search = `?key=${key}&q=${query}&orientation=${orientation}&safesearch=true`
	const resp = await fetch(path + search)
	const json = await resp.json<Pixabay>()

	const arr = json.hits as PixabayVideo[]
	const result: Video[] = arr.map((item) => ({
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

	return new Response(JSON.stringify({ 'pixabay-videos-search': result }), { headers })
}
