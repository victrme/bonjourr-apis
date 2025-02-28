import { unsplashImagesDaylight, unsplashImagesDaylightStore } from './unsplash/images/bonjourr'
import { pixabayVideosDaylight, pixabayVideosDaylightStore } from './pixabay/videos/bonjourr'
import { unsplashImagesUser } from './unsplash/images/user'
import { pixabayVideosUser } from './pixabay/videos/user'
import { pixabayImagesUser } from './pixabay/images/user'

import type { Env } from '..'

export default async function backgrounds(url: URL, env: Env, headers: Headers): Promise<Response> {
	//
	//	Store daylight

	if (url.pathname.includes('/backgrounds/daylight/store')) {
		await Promise.all([pixabayVideosDaylightStore(env), unsplashImagesDaylightStore(env)])
	}

	//	Get Daylight

	headers.set('Content-Type', 'application/json')
	headers.set('Cache-Control', 'public, max-age=10')

	if (url.pathname.includes('/backgrounds/daylight/images/unsplash')) {
		return await unsplashImagesDaylight(env, headers)
	}

	if (url.pathname.includes('/backgrounds/daylight/videos/pixabay')) {
		return await pixabayVideosDaylight(env, headers)
	}

	//	Get User: Unsplash

	if (url.pathname.includes('/backgrounds/user/images/unsplash')) {
		return unsplashImagesUser(url, env, headers)
	}

	//	Get User: Pixabay

	if (url.pathname.includes('/backgrounds/user/images/pixabay')) {
		return await pixabayImagesUser(url, env, headers)
	}

	if (url.pathname.includes('/backgrounds/user/videos/pixabay')) {
		return await pixabayVideosUser(url, env, headers)
	}

	//	Get User: <some other provider>

	// ...

	return new Response('Not found', {
		status: 404,
	})
}
