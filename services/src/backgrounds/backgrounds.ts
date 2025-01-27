import { userCollections, userTags } from './user'
import { bonjourrCollections } from './bonjourr'
import type { Env } from '..'

export default async function backgrounds(url: URL, env: Env, headers: Headers): Promise<Response> {
	if (url.pathname.includes('/backgrounds/bonjourr')) {
		return await bonjourrCollections(url, env, headers)
	}

	if (url.pathname.includes('/backgrounds/user/collections')) {
		// return await userCollections(url, env, headers)
	}

	if (url.pathname.includes('/backgrounds/user/tags')) {
		// return await userTags(url, env, headers)
	}

	return new Response('Not found', {
		status: 404,
	})
}
