import { expect } from '@std/expect'
import type { Fontsource } from '../../types/fonts.ts'

const response = await fetch('http://0.0.0.0:8787/fonts')
const fontlist = (await response?.json()) as Fontsource[]

Deno.test('has application/json as content-type', () => {
	expect(response.headers.get('content-type')).toBe('application/json')
})

Deno.test('has valid type', () => {
	expect(typeof fontlist[0].family).toBe('string')
	expect(typeof fontlist[0].variable).toBe('boolean')
	expect(Array.isArray(fontlist[0].subsets)).toBe(true)
	expect(Array.isArray(fontlist[0].weights)).toBe(true)
})

Deno.test('have all "latin" subset', () => {
	expect(fontlist.every((font) => font.subsets.includes('latin'))).toBe(true)
})

Deno.test('have at least "400" weight', () => {
	expect(fontlist.every((font) => font.weights.includes(400))).toBe(true)
})
