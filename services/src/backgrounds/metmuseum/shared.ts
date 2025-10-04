import type { MetObject, MetObjectsIds } from './types.ts'
import type { Image } from '../types.ts'

// https://metmuseum.github.io/#object

export function metObjectToBonjourr(item: MetObject): Image {
	if (!(item.primaryImage && item.primaryImageSmall)) {
		throw new Error('Tried to convert invalid item')
	}

	const result: Image = {
		format: 'image',
		username: item.artistDisplayName,
		page: item.objectURL,
		urls: {
			full: item.primaryImage,
			medium: item.primaryImageSmall,
			small: item.primaryImageSmall,
		},
	}

	return result
}

export async function fetchSingleObject(objectId: string): Promise<MetObject> {
	const base = 'https://collectionapi.metmuseum.org/public/collection/v1/objects'
	const resp = await fetch(`${base}/${objectId}`)
	const json = (await resp.json()) as MetObject

	return json
}

export async function fetchDepartmentObjectIds(department: string): Promise<MetObjectsIds> {
	const base = 'https://collectionapi.metmuseum.org/public/collection/v1/objects'
	const resp = await fetch(`${base}?departmentIds=${department}`)
	const json = (await resp.json()) as MetObjectsIds

	return json
}
