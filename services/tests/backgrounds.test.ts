import { expect } from '@std/expect'

import type { Image, Video } from '../src/backgrounds/types.ts'
import type { CollectionList, Media } from '../src/backgrounds/bonjourr/shared.ts'

const PUBLIC_PATHS = [
	'bonjourr/images/daylight',
	'bonjourr/videos/daylight',
	'unsplash/images/search',
	'unsplash/images/collections',
	'pixabay/images/search',
	'pixabay/videos/search',
	'metmuseum/images/paintings',
	// 'metmuseum/images/search',
	// 'metmuseum/images/filter',
] as const

// Responses, formats

Deno.test('can store daylight videos', async () => {
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

Deno.test('can store daylight images', async () => {
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

Deno.test('is response', async (test) => {
	const response = await fetch('http://0.0.0.0:8787/backgrounds/bonjourr/all')
	const medias: Media[] = await response.json<Media[]>()

	await test.step('Ok with JSON', () => {
		expect(response.status).toBe(200)
		expect(response.headers.get('content-type')).toBe('application/json')
	})

	await test.step('with correct media format', () => {
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

	await test.step('with all media in database', async (test) => {
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
})

// Paths

Deno.test('public path exists', async (test) => {
	//
	for (const path of PUBLIC_PATHS) {
		const base = 'http://0.0.0.0:8787/backgrounds/'

		await test.step(path, async () => {
			const resp = await fetch(base + path)
			expect(resp.status).not.toBe(404)
			await resp.body?.cancel()
		})
	}
})
