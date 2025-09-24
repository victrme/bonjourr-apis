export interface PexelsVideoPicture {
	id: number
	nr: number
	picture: string // .../2499611/pictures/preview-0.jpg
}

export interface PexelsVideoFile {
	id: number
	quality: string
	file_type: string
	width: number
	height: number
	link: string
}

export interface PexelsVideo {
	type: 'Video'
	id: number
	width: number
	height: number
	url: string // https://www.pexels.com/video/2499611/
	image: string // https://images.pexels.com/videos/2499611/...
	full_res: null
	avg_color: null
	duration: number
	user: {
		id: number
		name: string // Joey Farina
		url: string // https://www.pexels.com/@joey
	}
	video_files: PexelsVideoFile[]
	video_pictures: PexelsVideoPicture[]
}

export interface PexelsCollection {
	id: string
	page: number
	per_page: number
	total_results: number
	media: PexelsVideo[]
}
