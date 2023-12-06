// https://fontsource.org/docs/api/fonts

type Fontsource = {
	id: string
	family: string
	subsets: string[]
	weights: number[]
	variable: boolean
	category: string
	license: string
	type: 'google' | 'other'
}

type FontList = Pick<Fontsource, 'family' | 'subsets' | 'weights' | 'variable'>[]

export default async function fonts(headers: Headers): Promise<Response> {
	headers.set('Cache-Control', 'public, max-age=604800, immutable')
	headers.set('Content-Type', 'application/json')

	const fontlist: FontList = []

	try {
		const responses = await Promise.all([
			fetch('https://api.fontsource.org/v1/fonts'),
			fetch('https://cdn.jsdelivr.net/gh/victrme/bonjourr-apis@fonts/src/assets/font_popularity.txt'),
		])

		const fonts = (await responses[0]?.json()) as Fontsource[]
		const popularity = (await responses[1]?.text()).split(',')
		const familyOnly = fonts.map((font) => font.family)

		let font: Fontsource | undefined

		for (const family of popularity) {
			font = fonts[familyOnly.indexOf(family)]

			if (font && font.subsets.includes('latin') && font.category !== 'icons' && font.category !== 'other') {
				fontlist.push({
					family: font.family,
					subsets: font.subsets,
					weights: font.weights,
					variable: font.variable,
				})
			}
		}
	} catch (error) {
		console.error(error)
		headers.set('Cache-Control', 'no-cache')
	}

	return new Response(JSON.stringify(fontlist), {
		headers,
	})
}
