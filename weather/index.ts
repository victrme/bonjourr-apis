import meteo from "./meteo/src/index"

export default {
	async fetch(req: Request) {
		return await meteo.fetch(req)
	},
}
