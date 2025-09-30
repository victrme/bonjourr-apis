import { pixabayImageToGeneric } from '../convert.ts'

import type { Pixabay, PixabayImage } from '../types.ts'
import type { Image } from '../../types.ts'
import type { Env } from '../../../index.ts'

export async function pixabayImagesSearch(url: URL, env: Env, headers: Headers): Promise<Response> {
	const key = env.PIXABAY ?? ''
	const query = url.searchParams.get('query') ?? ''
	const orientation = url.searchParams.get('orientation') ?? 'all'

	const path = 'https://pixabay.com/api'
	const search = `?key=${key}&q=${query}&orientation=${orientation}&safesearch=true`
	const resp = await fetch(path + search)
	const json = await resp.json<Pixabay>()

	const arr = json.hits as PixabayImage[]
	const result: Image[] = arr.map((item) => pixabayImageToGeneric(item))

	return new Response(JSON.stringify({ 'pixabay-images-search': result }), {
		headers,
	})
}
