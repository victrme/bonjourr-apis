import type { PexelsVideo, PexelsVideoFile } from './types.ts'
import type { Video } from '../types.ts'

export function pexelsToGeneric(video: PexelsVideo): Video {
	const files = video.video_files.sort((a, b) => a.width - b.width)

	const nhd: PexelsVideoFile = files[0]
	const wxga: PexelsVideoFile = files.find((file) => file.height === 720) ?? files[1]
	const fhd: PexelsVideoFile = files.find((file) => file.height === 1080) ?? files[2]

	// console.log(video.video_files)

	return {
		format: 'video',
		page: video.url,
		username: video.user.name,
		duration: video.duration,
		thumbnail: video.video_pictures[0].picture,
		urls: {
			full: fhd.link,
			medium: wxga.link,
			small: nhd.link,
		},
	}
}
