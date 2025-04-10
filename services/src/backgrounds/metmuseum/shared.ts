import type { Image } from '../../../../types/backgrounds'

// https://metmuseum.github.io/#object

export interface MetObjectsIds {
	total: number
	objectIDs: number[]
}

export interface MetObject {
	objectID: number
	primaryImage?: string
	primaryImageSmall?: string
	additionalImages?: string[]
	constituents?: { name: string }[]
	title: string
	artistDisplayName: string
	objectDate: string
	city?: string
	state?: string
	county?: string
	country?: string
	region?: string
	subregion?: string
	objectURL: string
}

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

export async function fetchSingleObject(objectId: number): Promise<MetObject | undefined> {
	const base = 'https://collectionapi.metmuseum.org/public/collection/v1/objects'
	const resp = await fetch(`${base}/${objectId}`)
	const json = (await resp.json()) as MetObject

	if (json.objectID && json.primaryImage) {
		return json
	}
}

export async function fetchDepartmentObjectIds(department: string): Promise<MetObjectsIds> {
	const base = 'https://collectionapi.metmuseum.org/public/collection/v1/objects'
	const resp = await fetch(`${base}?departmentIds=${department}`)
	const json = (await resp.json()) as MetObjectsIds

	return json
}

export const MET_DEPARTMENTS = [
	{ departmentId: 1, displayName: 'American Decorative Arts' },
	{ departmentId: 3, displayName: 'Ancient Near Eastern Art' },
	{ departmentId: 4, displayName: 'Arms and Armor' },
	{ departmentId: 5, displayName: 'Arts of Africa, Oceania, and the Americas' },
	{ departmentId: 6, displayName: 'Asian Art' },
	{ departmentId: 7, displayName: 'The Cloisters' },
	{ departmentId: 8, displayName: 'The Costume Institute' },
	{ departmentId: 9, displayName: 'Drawings and Prints' },
	{ departmentId: 10, displayName: 'Egyptian Art' },
	{ departmentId: 11, displayName: 'European Paintings' },
	{ departmentId: 12, displayName: 'European Sculpture and Decorative Arts' },
	{ departmentId: 13, displayName: 'Greek and Roman Art' },
	{ departmentId: 14, displayName: 'Islamic Art' },
	{ departmentId: 15, displayName: 'The Robert Lehman Collection' },
	{ departmentId: 16, displayName: 'The Libraries' },
	{ departmentId: 17, displayName: 'Medieval Art' },
	{ departmentId: 18, displayName: 'Musical Instruments' },
	{ departmentId: 19, displayName: 'Photographs' },
	{ departmentId: 21, displayName: 'Modern Art' },
]
