import { fetchDepartmentObjectIds, fetchSingleObject, metObjectToBonjourr } from '../shared'
import type { Image } from '../../../../../types/backgrounds'

export async function randomMuseumObjects(url: URL, headers: Headers): Promise<Response> {
	const amount = Number.parseInt(url.searchParams.get('amount') ?? '20')
	const deps = url.searchParams.get('department') ?? '3|5|6|12|13|14|17'

	const departments = await fetchDepartmentObjectIds(deps)
	const results: Image[] = []
	let failAmount = 0

	while (results.length < amount || failAmount > 20) {
		const rand = Math.floor(Math.random() * departments.objectIDs.length)
		const id = departments.objectIDs[rand]
		const item = await fetchSingleObject(id)

		if (item) {
			results.push(metObjectToBonjourr(item))
		} else {
			failAmount++
		}
	}

	return new Response(JSON.stringify(results), {
		headers: headers,
	})
}
