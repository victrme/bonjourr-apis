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
