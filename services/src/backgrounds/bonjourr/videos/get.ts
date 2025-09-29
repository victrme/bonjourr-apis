import { getCollection } from '../shared.ts'

import type { Video } from '../../types.ts'
import type { Env } from '../../../index.ts'

export async function getDaylightVideos(env: Env, headers: Headers): Promise<Response> {
	const result: Record<string, Video[]> = {
		'bonjourr-videos-daylight-night': [],
		'bonjourr-videos-daylight-noon': [],
		'bonjourr-videos-daylight-day': [],
		'bonjourr-videos-daylight-evening': [],
	}

	for (const collection of Object.keys(result)) {
		const images = await getCollection<Video>(collection, env)
		result[collection].push(...images)
	}

	return new Response(JSON.stringify(result), { headers })
}
