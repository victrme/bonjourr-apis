import type { UnsplashImage, Image } from '../../../../types/backgrounds'
import type { Env } from '../..'

let clientId = ''

export const initUnsplashAuth = (env: Env) => {
	clientId = env.UNSPLASH ?? ''
}

export async function fetchUnsplash(search: string): Promise<UnsplashImage[]> {
	const headers = {
		'accept-version': 'v1',
		authorization: `Client-ID ${clientId}`,
	}

	const resp = await fetch(`https://api.unsplash.com/photos/random${search}`, { headers })
	const json = await resp.json()

	return json
}

export function toBonjourrImages(images: UnsplashImage[], w: string, h: string): Image[] {
	const width = Number.parseInt(w)
	const height = Number.parseInt(h)
	const paramsMedium = `&h=${Math.round(height / 2)}&w=${Math.round(width / 2)}&q=50`
	const paramsSmall = `&h=${Math.round(height / 10)}&w=${Math.round(width / 10)}&q=60`
	const paramsFull = `&h=${h}&w=${w}&q=80`

	return images.map(item => ({
		format: 'image',
		page: item.links.html,
		download: item.links.download,
		username: item.user.username,
		name: item.user.name,
		city: item?.location?.city || undefined,
		country: item?.location?.country || undefined,
		color: item.color,
		exif: item.exif,
		urls: {
			full: `${item.urls.raw}&auto=format&fit=crop&crop=entropy${paramsFull}`,
			medium: `${item.urls.raw}&auto=format&fit=crop&crop=entropy${paramsMedium}`,
			small: `${item.urls.raw}&auto=format&fit=crop&crop=entropy${paramsSmall}`,
		},
	}))
}
