import { expect } from '@std/expect'
import type { UnsplashPhoto } from '../src/backgrounds/unsplash/types.ts'

const url = 'http://0.0.0.0:8787/unsplash/photos/random?collections=GD4aOSg4yQE&count=8'
const response = await fetch(url)
const json = (await response.json()) as UnsplashPhoto[]

Deno.test('returns correct amount of images', () => {
	expect(json.length).toBe(8)
})

Deno.test('has correct fields', () => {
	const { color, urls, links, exif, user } = json[0]
	const exifkeys = ['make', 'model', 'exposure_time', 'aperture', 'focal_length', 'iso']

	expect(typeof color).toBe('string')
	expect(typeof urls.raw).toBe('string')
	expect(typeof links.html).toBe('string')
	expect(typeof user.username).toBe('string')
	expect(typeof user.name).toBe('string')
	expect(exifkeys.every((key) => key in exif)).toBe(true)
})
