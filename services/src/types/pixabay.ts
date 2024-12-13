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
