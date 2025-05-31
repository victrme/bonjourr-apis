import type { PixabayVideo } from '../../../../types/backgrounds'

export function resolutionBasedUrls(video: PixabayVideo) {
	const { large, medium, small, tiny } = video.videos
	const heights = Object.values(video.videos).map(({ height }) => height)

	if (heights.includes(2160)) {
		return {
			large: medium.url,
			medium: small.url,
			small: tiny.url,
		}
	}

	if (heights.includes(1440)) {
		return {
			large: large.url,
			medium: medium.url,
			small: small.url,
		}
	}

	return {
		large: large.url,
		medium: large.url,
		small: small.url,
	}
}
