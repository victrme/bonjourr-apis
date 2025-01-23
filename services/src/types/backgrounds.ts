export namespace Backgrounds {
	export type Provider = 'pixabay' | 'unsplash'

	/**
	 * Unified schema returned for Bonjourr Images
	 */
	export interface Image {
		/* All providers */
		url: string
		page: string
		username: string

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
		page: string
		username: string
		duration: number
		thumbnail: string
		urls: {
			large: string
			medium: string
			small: string
			tiny: string
		}
	}

	/**
	 * Raw output from their respective API endppoints
	 */
	export namespace API {
		/**
		 * Not everything is in there, only useful keys
		 */
		export interface UnsplashImage {
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

		export interface PixabayVideos {
			total: number
			totalHits: number
			hits: [
				{
					id: number
					pageURL: string
					type: string
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
			]
		}
	}
}
