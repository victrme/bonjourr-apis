export type Provider = 'pixabay' | 'unsplash'

/**
 * Unified schema returned for Bonjourr Images
 */
export interface Image {
	/* All providers */
	format: 'image'
	page: string
	username: string
	urls: {
		full: string
		medium: string
		small: string
	}

	/* Unsplash only */
	color?: string
	name?: string
	city?: string
	country?: string
	download?: string
	exif?: {
		make: string
		model: string
		exposure_time: string
		aperture: string
		focal_length: string
		iso: number
	}
}

/**
 * Unified schema returned for Bonjourr Videos
 */
export interface Video {
	format: 'video'
	page: string
	username: string
	duration: number
	thumbnail: string
	urls: {
		full: string
		medium: string
		small: string
	}
}

/**
 * Raw output from their respective API endppoints
 * Not everything is in there, only useful keys
 */
export interface UnsplashImage {
	id: string
	color: string
	blur_hash: string
	description: string
	exif: {
		make: string
		model: string
		exposure_time: string
		aperture: string
		focal_length: string
		iso: number
	}
	location: {
		name: string
		city: string
		country: string
	}
	urls: {
		raw: string
		regular: string
		small: string
	}
	links: {
		html: string
		download: string
	}
	user: {
		username: string
		name: string
		links: {
			html: string
		}
	}
}
