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
	const fontlist: FontList = []

	headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
	headers.set('Content-Type', 'application/json')

	try {
		const resp = await fetch('https://api.fontsource.org/v1/fonts')
		const fonts = (await resp.json()) as Fontsource[]

		for (const item of fonts) {
			if (item.subsets.includes('latin') && item.category !== 'icons') {
				fontlist.push({
					family: item.family,
					subsets: item.subsets,
					weights: item.weights,
					variable: item.variable,
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
