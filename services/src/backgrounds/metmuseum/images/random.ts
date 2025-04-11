import { fetchSingleObject, metObjectToBonjourr } from '../shared'
import type { MetObject } from '../shared'

export async function randomMuseumObjects(url: URL, headers: Headers): Promise<Response> {
	const amount = Math.min(Number.parseInt(url.searchParams.get('amount') ?? '20'), 40)

	const path = 'https://cdn.jsdelivr.net/gh/victrme/bonjourr-apis@refs/heads/main/assets/metmuseum_paintings.txt?r=1'
	const idsResp = await fetch(path)
	const idsString = await idsResp.text()
	const ids = idsString.split(',')

	const promises: Promise<MetObject>[] = []

	for (let i = 0; i < amount; i++) {
		const rand = Math.floor(Math.random() * ids.length)
		const id = ids[rand]
		promises.push(fetchSingleObject(id))
	}

	const responses = await Promise.all(promises)
	const results = responses.map(item => metObjectToBonjourr(item))

	return new Response(JSON.stringify(results), {
		headers: headers,
	})
}
