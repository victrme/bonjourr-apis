import type { UnsplashImage } from './types.ts'
import type { Env } from '../../index.ts'

let clientId = ''

export const initUnsplashAuth = (env: Env) => {
	clientId = env.UNSPLASH ?? ''
}

export async function fetchRandomUnsplash(search: string): Promise<UnsplashImage[]> {
	const path = `https://api.unsplash.com/photos/random${search}`
	const headers = { 'accept-version': 'v1', authorization: `Client-ID ${clientId}` }
	const resp = await fetch(path, { headers })
	const json = await resp.json<UnsplashImage[]>()

	return json
}

export async function getUnsplashPhoto(photo_id: string): Promise<UnsplashImage> {
	const path = `https://api.unsplash.com/photos/${photo_id}`
	const headers = { 'accept-version': 'v1', authorization: `Client-ID ${clientId}` }
	const resp = await fetch(path, { headers })
	const json = await resp.json<UnsplashImage>()

	return json
}

export async function getUnsplashCollectionPhoto(collection_id: string, page = 1): Promise<UnsplashImage[]> {
	const path = `https://api.unsplash.com/collections/${collection_id}/photos?per_page=30&page=${page}`
	const headers = { 'accept-version': 'v1', authorization: `Client-ID ${clientId}` }
	const resp = await fetch(path, { headers })
	const json = await resp.json<UnsplashImage[]>()

	return json
}
