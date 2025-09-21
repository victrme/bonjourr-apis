import { getCollection } from '../shared.ts'

import type { Image } from '../../../../types/backgrounds.ts'
import type { Env } from '../../../index.ts'

export async function getDaylightImages(env: Env, headers: Headers): Promise<Response> {
	const result: Record<string, Image[]> = {
		'bonjourr-images-daylight-night': [],
		'bonjourr-images-daylight-noon': [],
		'bonjourr-images-daylight-day': [],
		'bonjourr-images-daylight-evening': [],
	}

	for (const collection of Object.keys(result)) {
		const images = await getCollection<Image>(collection, env)
		result[collection].push(...images)
	}

	return new Response(JSON.stringify(result), { headers })
}
