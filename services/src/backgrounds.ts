import { unsplashImagesDaylight, unsplashImagesDaylightStore } from './backgrounds/unsplash/images/bonjourr.ts'
import { pixabayVideosDaylight, pixabayVideosDaylightStore } from './backgrounds/pixabay/videos/bonjourr.ts'
import { unsplashImagesCollections, unsplashImagesTags } from './backgrounds/unsplash/images/user.ts'
import { pixabayVideosTags } from './backgrounds/pixabay/videos/tags.ts'
import { pixabayImagesTags } from './backgrounds/pixabay/images/tags.ts'
import { initUnsplashAuth } from './backgrounds/unsplash/shared.ts'
import { backgroundsProxy } from './proxy.ts'

import type { Env } from './index.ts'

export async function backgrounds(url: URL, env: Env, headers: Headers): Promise<Response> {
	initUnsplashAuth(env)

	//	Get URLs proxy

	if (url.pathname.includes('/backgrounds/proxy/')) {
		return backgroundsProxy(url, headers)
	}

	//	Store daylight

	if (url.pathname.includes('/backgrounds/bonjourr/store')) {
		await Promise.all([pixabayVideosDaylightStore(env), unsplashImagesDaylightStore(env)])
		return new Response('Done')
	}

	//	Get Daylight

	headers.set('Content-Type', 'application/json')
	headers.set('Cache-Control', 'public, max-age=10')

	if (url.pathname.includes('/backgrounds/bonjourr/images/daylight')) {
		return await unsplashImagesDaylight(url, env, headers)
	}

	if (url.pathname.includes('/backgrounds/bonjourr/videos/daylight')) {
		return await pixabayVideosDaylight(env, headers)
	}

	//	Get Unsplash

	if (url.pathname.includes('/backgrounds/unsplash/images/collections')) {
		return unsplashImagesCollections(url, headers)
	}

	if (url.pathname.includes('/backgrounds/unsplash/images/tags')) {
		return unsplashImagesTags(url, headers)
	}

	//	Get Pixabay

	if (url.pathname.includes('/backgrounds/pixabay/images/tags')) {
		return await pixabayImagesTags(url, env, headers)
	}

	if (url.pathname.includes('/backgrounds/pixabay/videos/tags')) {
		return await pixabayVideosTags(url, env, headers)
	}

	//	Get <some other provider>

	// ...

	return new Response('Not found', {
		status: 404,
	})
}
