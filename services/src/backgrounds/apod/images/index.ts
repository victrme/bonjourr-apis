import { extractHtmlContent } from '../shared'

export async function pictureOfTheDay() {
	const html = await extractHtmlContent()

	return new Response(html)
}
