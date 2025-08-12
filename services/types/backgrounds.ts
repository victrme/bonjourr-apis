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

export interface Pixabay {
	total: number
	totalHits: number
	hits: (PixabayImage | PixabayVideo)[]
}

export interface PixabayImage {
	type: 'photo'
	id: number
	pageURL: string
	tags: string
	previewURL: string
	previewWidth: number
	previewHeight: number
	webformatURL: string
	webformatWidth: number
	webformatHeight: number
	largeImageURL: string
	fullHDURL: string
	imageURL: string
	imageWidth: number
	imageHeight: number
	imageSize: number
	views: number
	downloads: number
	likes: number
	comments: number
	user_id: number
	user: string
	userImageURL: string
}

export interface PixabayVideo {
	type: 'film'
	id: number
	pageURL: string
	tags: string
	duration: number
	videos: {
		large: {
			url: string
			width: number
			height: number
			size: number
			thumbnail: string
		}
		medium: {
			url: string
			width: number
			height: number
			size: number
			thumbnail: string
		}
		small: {
			url: string
			width: number
			height: number
			size: number
			thumbnail: string
		}
		tiny: {
			url: string
			width: number
			height: number
			size: number
			thumbnail: string
		}
	}
	views: number
	downloads: number
	likes: number
	comments: number
	user_id: number
	user: string
	userImageURL: string
}
