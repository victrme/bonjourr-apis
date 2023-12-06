export interface Onecall {
	lat: number
	lon: number
	current: {
		dt: number
		sunrise: number
		sunset: number
		temp: number
		feels_like: number
		weather: {
			id: number
			main: string
			description: string
			icon: string
		}[]
	}
	hourly: {
		dt: number
		temp: number
		feels_like: number
		weather: {
			id: number
			main: string
			description: string
			icon: string
		}[]
	}[]
}

export interface Current {
	name: string
	cod: number
	coord: {
		lon: number
		lat: number
	}
	weather: {
		id: number
		main: string
		description: string
		icon: string
	}[]
	main: {
		temp: number
		feels_like: number
	}
	dt: number
	sys: {
		country: string
		sunrise: number
		sunset: number
	}
}

export interface Forecast {
	cod: string
	list: {
		dt: number
		main: {
			temp: number
			feels_like: number
		}
		weather: {
			id: number
			main: string
			description: string
			icon: string
		}[]
	}[]
}

export interface Geo {
	name: string
	lat: number
	lon: number
	country: string
}
