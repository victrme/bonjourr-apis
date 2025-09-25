export interface UnsplashPhoto {
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
	}
	links: {
		html: string
	}
	user: {
		username: string
		name: string
		links: {
			html: string
		}
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
