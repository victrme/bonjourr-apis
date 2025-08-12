import { fetchSingleObject, metObjectToBonjourr } from '../shared.ts'
import type { MetObject, MetObjectsIds } from '../shared.ts'

export async function metMuseumSearch(url: URL, headers: Headers): Promise<Response> {
	const amount = Math.min(Number.parseInt(url.searchParams.get('amount') ?? '10'), 40)
	const search = Math.min(Number.parseInt(url.searchParams.get('search') ?? '1'), 40)

	const resp = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${search}`)
	const objects = (await resp.json()) as MetObjectsIds
	const ids = objects.objectIDs
	const list: MetObject[] = []

	for (let i = 0; i < amount + 20; i++) {
		const rand = Math.floor(Math.random() * ids.length)
		const id = ids[rand].toString()
		const item = await fetchSingleObject(id)

		if (item.primaryImage) {
			list.push(item)
		}

		if (list.length === amount) {
			const images = list.map((item) => metObjectToBonjourr(item))
			const body = JSON.stringify({ 'metmuseum-images-search': images })

			return new Response(body, { headers })
		}
	}

	return new Response(JSON.stringify({ 'metmuseum-images-search': [] }), {
		headers: headers,
		status: 400,
	})
}
