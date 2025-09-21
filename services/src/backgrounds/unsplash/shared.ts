import type { UnsplashImage } from '../../../types/backgrounds.ts'
import type { Env } from '../../index.ts'

let clientId = ''

export const initUnsplashAuth = (env: Env) => {
	clientId = env.UNSPLASH ?? ''
}

export async function fetchUnsplash(search: string): Promise<UnsplashImage[]> {
	const headers = {
		'accept-version': 'v1',
		authorization: `Client-ID ${clientId}`,
	}

	const resp = await fetch(`https://api.unsplash.com/photos/random${search}`, { headers })
	const json = await resp.json<UnsplashImage[]>()

	return json
}
