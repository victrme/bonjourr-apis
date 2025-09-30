import { unsplashImagesCollections, unsplashImagesSearch } from './unsplash/images/user.ts'
import { storeDaylightVideos } from './bonjourr/videos/store.ts'
import { pixabayVideosSearch } from './pixabay/videos/search.ts'
import { pixabayImagesSearch } from './pixabay/images/search.ts'
import { storeDaylightImages } from './bonjourr/images/store.ts'
import { metMuseumPaintings } from './metmuseum/images/paintings.ts'
import { getDaylightImages } from './bonjourr/images/get.ts'
import { getDaylightVideos } from './bonjourr/videos/get.ts'
import { getAllStoredMedia } from './bonjourr/all.ts'
import { initUnsplashAuth } from './unsplash/shared.ts'
import { backgroundsProxy } from './proxy.ts'
import { metMuseumSearch } from './metmuseum/images/search.ts'
import { filterPaintings } from './metmuseum/filter.ts'

import type { Env } from '../index.ts'

export async function backgrounds(url: URL, env: Env, headers: Headers): Promise<Response> {
	initUnsplashAuth(env)

	//	Get URLs proxy

	if (url.pathname.includes('/backgrounds/proxy/')) {
		return backgroundsProxy(url, headers)
	}

	headers.set('Content-Type', 'application/json')
	headers.set('Cache-Control', 'public, max-age=10')

	//	Store daylight

	if (url.pathname.includes('/backgrounds/bonjourr/images/daylight/store')) {
		return await storeDaylightImages(env, headers)
	}
	if (url.pathname.includes('/backgrounds/bonjourr/videos/daylight/store')) {
		return await storeDaylightVideos(env, headers)
	}

	//	Get Daylight

	if (url.pathname.includes('/backgrounds/bonjourr/all')) {
		return await getAllStoredMedia(env, headers)
	}
	if (url.pathname.includes('/backgrounds/bonjourr/images/daylight')) {
		return await getDaylightImages(env, headers)
	}
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
