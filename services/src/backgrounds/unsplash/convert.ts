import type { UnsplashImage } from '../unsplash/types.ts'
import type { Image } from '../types.ts'

export function unsplashToGeneric(image: UnsplashImage): Image {
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
			full: image.urls.raw,
			medium: image.urls.raw,
			small: image.urls.raw,
		},
	}
}
