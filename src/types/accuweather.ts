namespace AccuWeather {
	export interface Data {
		lat: number
		lon: number
		city: string
		region: string
		link: string
		now: Now
		sun: Sun
		today?: Today
		hourly: Hourly[]
		daily: Daily[]
	}

	export type Today = {
		day: string
		night: string
		high: number
		low: number
	}

	export type Now = {
		icon: number
		temp: number
		feels: number
		description: string
	}

	export type Sun = {
		duration: string
		rise: number
		set: number
	}

	export type Hourly = {
		timestamp: number
		temp: number
		rain: string
	}

	export type Daily = {
		timestamp: number
		high: number
		low: number
		day: string
		night: string
		rain: string
	}
}
