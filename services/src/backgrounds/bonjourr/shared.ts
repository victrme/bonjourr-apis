import type { Image, Video } from '../types.ts'
import type { Env } from '../../index.ts'

export type Media = Image | Video
export type CollectionList = Record<string, Media[]>

export async function storeCollection(env: Env, name: string, collection: Media[]): Promise<void> {
	const createStatement = `
		CREATE TABLE IF NOT EXISTS "${name}" (
			id TEXT PRIMARY KEY,
			data JSON NOT NULL
		);
	`

	await env.DB.prepare(createStatement).run()

	const promises = collection.map(async (json) => {
		const key = json.urls.full
		const data = JSON.stringify(json)
		const insertStatement = `INSERT INTO "${name}" (id, data) VALUES (?, ?)`
		await env.DB.prepare(insertStatement).bind(key, data).run()

		// console.info(`Stored ${key} on ${name}`)
	})

	try {
		await Promise.all(promises)
	} catch (_) {
		// ...
	}
}

export async function getCollection<Media extends Image | Video>(name: string, env: Env): Promise<Media[]> {
	const randomStatement = `SELECT data FROM "${name}" ORDER BY RANDOM() LIMIT 10`
	const { results } = await env.DB.prepare(randomStatement).all()
	const list: Media[] = []

	if (results.length === 0) {
		throw new Error('Collection could not be found')
	}

	for (const row of results) {
		list.push(JSON.parse(row.data))
	}

	return list
}

export async function getAllInCollection(name: string, env: Env): Promise<Media[]> {
	const randomStatement = `SELECT data FROM "${name}"`
	const { results } = await env.DB.prepare(randomStatement).all()
	const list: Media[] = []

	if (results.length === 0) {
		throw new Error('Collection could not be found')
	}

	for (const row of results) {
		list.push(JSON.parse(row.data))
	}

	return list
}
