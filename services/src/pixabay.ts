export default async function pixabay(url: URL, key?: string) {
	const search = url.search.replace('?', '&')
	const query = `https://pixabay.com/api/?key=${key}${search}`

	return await fetch(query)
}
