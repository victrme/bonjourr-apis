import type { Backgrounds } from "../../../types/backgrounds"
import type { Env } from "../../.."

export async function pixabayImagesTags(url: URL, env: Env, headers: Headers): Promise<Response> {
	const key = env.PIXABAY ?? ""
	const query = url.searchParams.get("query") ?? ""
	const orientation = url.searchParams.get("orientation") ?? "all"

	const path = "https://pixabay.com/api"
	const search = `?key=${key}&q=${query}&orientation=${orientation}&safesearch=true`
	const resp = await fetch(path + search)
	const json = await resp.json()

	const arr = json.hits as Backgrounds.API.PixabayImage[]
	const result: Backgrounds.Image[] = arr.map(item => ({
		format: "image",
		urls: {
			full: item.largeImageURL,
			medium: item.imageURL,
			small: item.previewURL,
		},
		page: item.pageURL,
		username: item.user,
	}))

	return new Response(JSON.stringify({ "pixabay-images-user": result }), {
		headers,
	})
}
