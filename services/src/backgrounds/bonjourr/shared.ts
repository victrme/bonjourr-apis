import type { Image, Video } from '../../../types/backgrounds.ts'
import type { Env } from '../../index.ts'

type Collection = Record<string, JSON>

export async function storeCollection(name: string, env: Env, collection: Collection[]): Promise<void> {
	const createStatement = `
		CREATE TABLE IF NOT EXISTS "${name}" (
			id TEXT PRIMARY KEY,
			data JSON NOT NULL
		);
	`

	await env.DB.prepare(createStatement).run()

	const promises = collection.map(async ({ key, json }) => {
		const data = JSON.stringify(json)
		const insertStatement = `INSERT INTO "${name}" (id, data) VALUES (?, ?)`
		await env.DB.prepare(insertStatement).bind(key, data).run()

		console.info(`Stored ${key} on ${name}`)
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
