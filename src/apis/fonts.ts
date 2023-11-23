export declare namespace google.fonts {
	interface WebfontList {
		kind: string
		items: WebfontFamily[]
	}

	interface WebfontFamily {
		category?: string | undefined
		kind: string
		family: string
		subsets: string[]
		variants: string[]
		version: string
		lastModified: string
		axes?: {
			tag: 'wght' | 'wdth'
			start: number
			end: number
		}[]
		files: { [variant: string]: string }
	}
}

type FontList = {
	family: string
	weights: string[]
	variable: boolean
}[]

export default async function fonts(req: Request, ctx: ExecutionContext, key: string, headers: Headers): Promise<Response> {
	const url = new URL(req.url)

	switch (url.pathname) {
		case '/font':
		case '/font/':
			return await getFont(url, headers)

		case '/font/list':
		case '/font/list/':
			return await getFontList(key, headers)
	}

	return new Response(undefined, {
		status: 404,
		headers,
	})
}

async function getFont(url: URL, headers: Headers) {
	let family = decodeURI(url.searchParams.get('family') ?? '')
	const subset = decodeURI(url.searchParams.get('subset') ?? 'latin')
	const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
	const initRequest = { headers: { 'User-Agent': userAgent } }

	family = family
		.split(' ')
		.map((a) => capitalizeWord(a))
		.join('+')

	const resp = await fetch(`https://fonts.googleapis.com/css2?family=${family}`, initRequest)
	const text = await resp.text()

	return new Response(text, {
		status: resp.status,
		headers,
	})
}

async function getFontList(key: string, headers: Headers): Promise<Response> {
	const url = 'https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&capability=WOFF2&capability=VF&key=' + key
	const resp = await fetch(url)
	const json = (await resp.json()) as google.fonts.WebfontList
	let weights: string[] = []
	let list: FontList = []

	// json has at least one available family
	if (json.items?.length > 0 && 'family' in json.items[0]) {
		const noRegulars = (arr: string[]) => arr.map((weight) => weight.replace('regular', '400'))
		const noItalics = (arr: string[]) => arr.filter((str) => !str.includes('italic'))

		for (const item of json.items) {
			//
			// If variable, infer weights from axes
			if (!!item?.axes) {
				// Some variable fonts doesn't have wght
				if (item.axes.some((axe) => axe.tag === 'wght')) {
					const { start, end } = item.axes.filter((axe) => axe.tag === 'wght')[0]
					for (let ii = start; ii <= end; ii += 100) {
						weights.push(ii.toString())
					}
				} else {
					weights = ['400']
				}

				//
			} else {
				weights = noRegulars(noItalics(item.variants))
			}

			list.push({
				family: item.family,
				variable: !!item?.axes,
				weights,
			})

			weights = []
		}
	}

	headers.set('content-type', 'application/json')
	headers.set('Cache-Control', 'public, max-age=604800')

	return new Response(JSON.stringify(json), {
		status: resp.status,
		headers,
	})
}

function capitalizeWord(word: string): string {
	return word.charAt(0).toUpperCase() + word.slice(1)
}
