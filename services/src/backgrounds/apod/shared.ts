export async function extractHtmlContent() {
	const resp = await fetch('https://apod.nasa.gov')
	const html = resp.text()

	return html
}
