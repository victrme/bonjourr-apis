import meteo from './meteo/src/index.ts'

export default {
	async fetch(req: Request) {
		return await meteo.fetch(req)
	},
}
