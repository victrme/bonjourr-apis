import type { Fontsource } from "../../types/fonts"

type FontList = Pick<Fontsource, "family" | "subsets" | "weights" | "variable">[]

export async function fonts(headers: Headers): Promise<Response> {
	headers.set("Cache-Control", "public, max-age=604800, immutable")
	headers.set("Content-Type", "application/json")

	const fontlist: FontList = []

	try {
		const responses = await Promise.all([
			fetch("https://api.fontsource.org/v1/fonts"),
			fetch("https://cdn.jsdelivr.net/gh/victrme/bonjourr-apis/assets/font_popularity.txt"),
		])

		const fonts = (await responses[0]?.json()) as Fontsource[]
		const popularFonts = (await responses[1]?.text()) ?? ""
		const popularFontsArr = popularFonts.split(",")
		const familyOnly = fonts.map(font => font.family)

		let font: Fontsource | undefined

		for (const family of popularFontsArr) {
			font = fonts[familyOnly.indexOf(family)]

			if (
				font?.subsets.includes("latin") &&
				font?.weights.includes(400) &&
				font?.category !== "icons" &&
				font?.category !== "other"
			) {
				fontlist.push({
					family: font.family,
					subsets: font.subsets,
					weights: font.weights,
					variable: font.variable,
				})
			}
		}
	} catch (error) {
		console.error(error)
		headers.set("Cache-Control", "no-cache")
	}

	return new Response(JSON.stringify(fontlist), {
		headers,
	})
}
