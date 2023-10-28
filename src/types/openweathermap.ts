export { Forecast, Current, Onecall }

type Onecall = {
	lat: number
	lon: number
	current: {
		dt: number
		sunrise: number
		sunset: number
		temp: number
		feels_like: number
		weather: WeatherInfos[]
	}
	hourly: {
		dt: number
		temp: number
		feels_like: number
		weather: WeatherInfos[]
	}[]
}

type Current = {
	name: string
	cod: number
	coord: {
		lon: number
		lat: number
	}
	weather: WeatherInfos[]
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

type Forecast = {
	cod: string
	list: {
		dt: number
		main: {
			temp: number
			feels_like: number
		}
		weather: WeatherInfos[]
	}[]
}

type WeatherInfos = {
	id: number
	main: string
	description: string
	icon: string
}
