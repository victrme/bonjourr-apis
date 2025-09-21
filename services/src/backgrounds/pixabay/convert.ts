import type { Image, PixabayImage, PixabayVideo, Video } from '../../../types/backgrounds.ts'
import { resolutionBasedUrls } from './shared.ts'

export function pixabayVideoToGeneric(video: PixabayVideo): Video {
	const urls = resolutionBasedUrls(video)

	return {
		format: 'video',
		page: video.pageURL,
		username: video.user,
		duration: video.duration,
		thumbnail: video.videos.large.thumbnail,
		urls: {
			full: urls.large,
			medium: urls.medium,
			small: urls.small,
		},
	}
}

export function pixabayImageToGeneric(image: PixabayImage): Image {
	return {
		format: 'image',
		urls: {
			full: image.largeImageURL,
			medium: image.webformatURL,
			small: image.previewURL,
		},
		page: image.pageURL,
		username: image.user,
	}
}
