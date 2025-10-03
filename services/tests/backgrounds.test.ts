import { expect } from '@std/expect'

import type { Image, Video } from '../src/backgrounds/types.ts'
import type { CollectionList, Media } from '../src/backgrounds/bonjourr/shared.ts'

const response = await fetch('http://0.0.0.0:8787/backgrounds/bonjourr/all')
const medias: Media[] = await response.json<Media[]>()

const BACKGROUND_PATHS = [
	'bonjourr/all',
	'bonjourr/images/daylight',
	'bonjourr/videos/daylight',
	'bonjourr/images/daylight/store',

	'unsplash/images/search',
	'unsplash/images/collections',

	'pixabay/images/search',
	'pixabay/videos/search',

	'metmuseum/images/paintings',
	'metmuseum/images/search',
	'metmuseum/images/filter',
] as const

Deno.test('is path correct', async (test) => {
	//
	for (const path of BACKGROUND_PATHS) {
		const base = 'http://0.0.0.0:8787/backgrounds/'

		await test.step(path, async () => {
			const resp = await fetch(base + path)
			expect(resp.status).not.toBe(404)
			await resp.body?.cancel()
		})
	}
})

Deno.test.ignore('can store daylight', async (test) => {
	await test.step('videos', async () => {
		const response = await fetch('http://0.0.0.0:8787/backgrounds/bonjourr/videos/daylight/store')
		const collections: CollectionList = await response.json()
		let areCorrectFormat = true

		for (const medias of Object.values(collections)) {
			for (const media of medias) {
				if (media.format !== 'video') {
					areCorrectFormat = false
				}
			}
		}

		expect(areCorrectFormat).toBe(true)
	})

	await test.step('images', async () => {
		const response = await fetch('http://0.0.0.0:8787/backgrounds/bonjourr/images/daylight/store')
		const collections: CollectionList = await response.json()
		let areCorrectFormat = true

		for (const medias of Object.values(collections)) {
			for (const media of medias) {
				if (media.format !== 'image') {
					areCorrectFormat = false
				}
			}
		}

		expect(areCorrectFormat).toBe(true)
	})
})

Deno.test.ignore('has correct response', () => {
	expect(response.status).toBe(200)
	expect(response.headers.get('content-type')).toBe('application/json')
})

Deno.test.ignore('medias has correct format', () => {
	for (const media of medias) {
		expect(new URL(media.urls.full)).toBeTruthy()
		expect(new URL(media.urls.medium)).toBeTruthy()
		expect(new URL(media.urls.small)).toBeTruthy()

		if (media.format === 'image') {
			const image = media as Image

			expect(new URL(image.page)).toBeTruthy()
			expect(typeof image.username).toBe('string')
		}

		if (media.format === 'video') {
			const video = media as Video

			expect(new URL(video.page)).toBeTruthy()
			expect(typeof video.duration).toBe('number')
			expect(typeof video.thumbnail).toBe('string')
			expect(typeof video.username).toBe('string')
		}
	}
})

Deno.test.ignore('is media in database', async (test) => {
	const baseUrl = 'https://medias.bonjourr.fr'
	const bonjourrMedias = medias.filter((media) => media.urls.full.startsWith(baseUrl))

	for (const media of bonjourrMedias) {
		const url = new URL(media.urls.full)
		const key = url.pathname

		await test.step(key, async () => {
			const resp = await fetch(media.urls.full)
			const contentType = resp.headers.get('content-type')

			expect(resp.status).toBe(200)

			if (media.format === 'video') {
				expect(contentType).toBe('video/webm')
			}

			await resp.body?.cancel()
		})
	}
})
