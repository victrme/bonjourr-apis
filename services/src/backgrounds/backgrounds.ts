import { userCollectionsOrTags } from './user'
import { daylightCollections } from './daylight'
import { storeCollections } from './store/store'

import type { Env } from '..'

export default async function backgrounds(url: URL, env: Env, headers: Headers): Promise<Response> {
	if (url.pathname.includes('/backgrounds/daylight/store')) {
		return await storeCollections(url, env)
	}

	if (url.pathname.includes('/backgrounds/daylight')) {
		return await daylightCollections(url, env, headers)
	}

	if (url.pathname.includes('/backgrounds/user')) {
		return await userCollectionsOrTags(url, env, headers)
	}

	return new Response('Not found', {
		status: 404,
	})
}
