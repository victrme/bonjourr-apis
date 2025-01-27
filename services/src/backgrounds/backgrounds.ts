import { userCollections, userTags } from './user'
import { bonjourrCollections } from './bonjourr'
import { storeCollections } from './store'

import type { Env } from '..'

export default async function backgrounds(url: URL, env: Env, headers: Headers): Promise<Response> {
	if (url.pathname.includes('/backgrounds/store/collections')) {
		return await storeCollections(url, env)
	}

	if (url.pathname.includes('/backgrounds/bonjourr')) {
		return await bonjourrCollections(url, env, headers)
	}

	if (url.pathname.includes('/backgrounds/user/collections')) {
		await userCollections(url, env, headers)
	}

	if (url.pathname.includes('/backgrounds/user/tags')) {
		await userTags(url, env, headers)
	}

	return new Response('Not found', {
		status: 404,
	})
}
