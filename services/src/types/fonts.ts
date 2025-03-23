export interface Fontsource {
	id: string
	family: string
	subsets: string[]
	weights: number[]
	variable: boolean
	category: string
	license: string
	type: "google" | "other"
}
