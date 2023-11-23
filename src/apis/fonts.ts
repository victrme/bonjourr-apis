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
	const url = 'https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&capability=VF&key=' + key
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

	return new Response(JSON.stringify(json), {
		status: resp.status,
		headers,
	})
}
