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

export function convertToBonjourr(images: UnsplashImage[]): Image[] {
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
			full: item.urls.raw,
			medium: item.urls.regular,
			small: item.urls.small,
		},
	}))
}
