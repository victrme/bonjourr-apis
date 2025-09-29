import type { UnsplashImage } from './types.ts'
import type { Image } from '../types.ts'
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

export function addUnsplashCropToImage(image: Image, w = '1920', h = '1080'): Image {
	if (!image.urls.full.includes('unsplash.com')) {
		return image
	}

	const width = Number.parseInt(w)
	const height = Number.parseInt(h)
	const paramsMedium = `&h=${Math.round(height / 2)}&w=${Math.round(width / 2)}&q=50`
	const paramsSmall = `&h=${Math.round(height / 10)}&w=${Math.round(width / 10)}&q=60`
	const paramsFull = `&h=${h}&w=${w}&q=80`

	image.urls.full = `${image.urls.full}&auto=format&fit=crop&crop=entropy${paramsFull}`
	image.urls.medium = `${image.urls.medium}&auto=format&fit=crop&crop=entropy${paramsMedium}`
	image.urls.small = `${image.urls.small}&auto=format&fit=crop&crop=entropy${paramsSmall}`

	return image
}
