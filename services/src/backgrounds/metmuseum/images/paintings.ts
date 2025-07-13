import { fetchSingleObject, metObjectToBonjourr } from '../shared.ts'
import type { MetObject } from '../shared.ts'

export async function metMuseumPaintings(url: URL, headers: Headers): Promise<Response> {
	const amount = Math.min(Number.parseInt(url.searchParams.get('amount') ?? '10'), 40)

	const basegit = 'https://raw.githubusercontent.com/victrme/bonjourr-apis'
	const pathgit = '/refs/heads/main/assets/metmuseum_paintings.txt'
	const idsResp = await fetch(basegit + pathgit)
	const idsString = await idsResp.text()
	const ids = idsString.split(',')

	const promises: Promise<MetObject>[] = []

	for (let i = 0; i < amount; i++) {
		const rand = Math.floor(Math.random() * ids.length)
		const id = ids[rand]
		promises.push(fetchSingleObject(id))
	}

	const responses = await Promise.all(promises)
	const results = responses.map((item) => metObjectToBonjourr(item))

	return new Response(JSON.stringify({ 'metmuseum-images-paintings': results }), {
		headers: headers,
	})
}
