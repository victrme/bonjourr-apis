import type { Image, UnsplashImage } from '../../../types/backgrounds.ts'

export function unsplashToGeneric(image: UnsplashImage, w = '1920', h = '1080'): Image {
	const width = Number.parseInt(w)
	const height = Number.parseInt(h)
	const paramsMedium = `&h=${Math.round(height / 2)}&w=${Math.round(width / 2)}&q=50`
	const paramsSmall = `&h=${Math.round(height / 10)}&w=${Math.round(width / 10)}&q=60`
	const paramsFull = `&h=${h}&w=${w}&q=80`

	return {
		format: 'image',
		page: image.links.html,
		download: image.links.download,
		username: image.user.username,
		name: image.user.name,
		city: image?.location?.city || undefined,
		country: image?.location?.country || undefined,
		color: image.color,
		exif: image.exif,
		urls: {
			full: `${image.urls.raw}&auto=format&fit=crop&crop=entropy${paramsFull}`,
			medium: `${image.urls.raw}&auto=format&fit=crop&crop=entropy${paramsMedium}`,
			small: `${image.urls.raw}&auto=format&fit=crop&crop=entropy${paramsSmall}`,
		},
	}
}
