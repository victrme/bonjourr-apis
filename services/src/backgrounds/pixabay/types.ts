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
