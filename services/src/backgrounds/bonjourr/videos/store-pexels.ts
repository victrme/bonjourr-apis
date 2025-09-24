import type { CollectionList } from '../shared.ts'
import type { Env } from '../../../index.ts'

export async function pexelsMetadataStore(env: Env): Promise<unknown> {
	const auth = env.PEXELS ?? ''
	const url = 'https://api.pexels.com/v1/collections/zcxjbgh'
	const headers = { 'Authorization': auth }
	const resp = await fetch(url, { headers })
	const json = await resp.json()

	console.log(json)

	return '??'
}
