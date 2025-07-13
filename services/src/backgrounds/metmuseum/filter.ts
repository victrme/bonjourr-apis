import { fetchSingleObject, type MetObject } from './shared.ts'

export async function filterPaintings() {
	const path = 'https://cdn.jsdelivr.net/gh/victrme/bonjourr-apis@refs/heads/main/assets/metmuseum_paintings.txt'
	const idsResp = await fetch(path)
	const idsString = await idsResp.text()
	const ids = idsString.split(',')

	const results: number[] = []
	const max = ids.length - 1
	let count = 0

	while (count <= max) {
		const promises: Promise<MetObject | undefined>[] = []

		for (let i = 0; i < 48; i++) {
			if (count + i <= max) {
				const id = ids[count]
				promises.push(fetchSingleObject(id))
			}

			count++
		}

		const responses = await Promise.all(promises)

		for (const item of responses) {
			if (item?.primaryImage && item?.primaryImageSmall) {
				results.push(item.objectID)
			}
		}
	}

	return new Response(JSON.stringify(results), { headers: { 'content-type': 'application/json' } })
}
