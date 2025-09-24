import { unsplashImagesCollections, unsplashImagesSearch } from './backgrounds/unsplash/images/user.ts'
import { storeDaylightVideos } from './backgrounds/bonjourr/videos/store.ts'
import { pixabayVideosSearch } from './backgrounds/pixabay/videos/search.ts'
import { pixabayImagesSearch } from './backgrounds/pixabay/images/search.ts'
import { metMuseumPaintings } from './backgrounds/metmuseum/images/paintings.ts'
import { initUnsplashAuth } from './backgrounds/unsplash/shared.ts'
import { backgroundsProxy } from './proxy.ts'
import { metMuseumSearch } from './backgrounds/metmuseum/images/search.ts'
import { filterPaintings } from './backgrounds/metmuseum/filter.ts'

import type { Env } from './index.ts'
import { getDaylightVideos } from './backgrounds/bonjourr/videos/get.ts'

export async function backgrounds(
	url: URL,
	env: Env,
	headers: Headers,
): Promise<Response> {
	initUnsplashAuth(env)

	//	Get URLs proxy

	if (url.pathname.includes('/backgrounds/proxy/')) {
		return backgroundsProxy(url, headers)
	}

	//	Store daylight

	if (url.pathname.includes('/backgrounds/bonjourr/videos/daylight/store')) {
		return await storeDaylightVideos(env, headers)
	}

	//	Get Daylight

	headers.set('Content-Type', 'application/json')
	headers.set('Cache-Control', 'public, max-age=10')

	// if (url.pathname.includes('/backgrounds/bonjourr/images/daylight')) {
	// 	return await unsplashImagesDaylight(url, env, headers)
	// }

	if (url.pathname.includes('/backgrounds/bonjourr/videos/daylight')) {
		return await getDaylightVideos(env, headers)
	}

	//	Get Unsplash

	if (url.pathname.includes('/backgrounds/unsplash/images/collections')) {
		return unsplashImagesCollections(url, headers)
	}

	if (url.pathname.includes('/backgrounds/unsplash/images/search')) {
		return unsplashImagesSearch(url, headers)
	}

	//	Get Pixabay

	if (url.pathname.includes('/backgrounds/pixabay/images/search')) {
		return await pixabayImagesSearch(url, env, headers)
	}

	if (url.pathname.includes('/backgrounds/pixabay/videos/search')) {
		return await pixabayVideosSearch(url, env, headers)
	}

	// Get MET Museum

	if (url.pathname.includes('/backgrounds/metmuseum/images/filter')) {
		return await filterPaintings()
	}

	if (url.pathname.includes('/backgrounds/metmuseum/images/paintings')) {
		return await metMuseumPaintings(url, headers)
	}

	if (url.pathname.includes('/backgrounds/metmuseum/images/search')) {
		return await metMuseumSearch(url, headers)
	}

	//	Get <some other provider>

	// ...

	return new Response('Not found', {
		status: 404,
	})
}
