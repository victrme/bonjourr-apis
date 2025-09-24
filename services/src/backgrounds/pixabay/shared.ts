import type { PixabayVideo } from '../../../types/backgrounds.ts'

export function resolutionBasedUrls(video: PixabayVideo) {
	const { large, medium, small, tiny } = video.videos
	const heights = Object.values(video.videos).map(({ height }) => height)

	if (heights.includes(2160)) {
		return {
			large: small.url, // 1080
			medium: small.url, // 1080
			small: tiny.url, // 720
		}
	}

	if (heights.includes(1440)) {
		return {
			large: medium.url, // 1080
			medium: small.url, // 720
			small: tiny.url, // 540
		}
	}

	return {
		large: large.url, // 1080
		medium: medium.url, // 720
		small: small.url, // 540
	}
}
