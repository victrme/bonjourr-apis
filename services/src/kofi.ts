import type { Env } from './index.ts'

export async function kofi(request: Request, env: Env): Promise<Response> {
	const headers = {
		'Access-Control-Allow-Origin': '*',
		'content-type': 'application/json',
		'cache-control': 'public, max-age=31536000, immutable',
	}

	// Parse GET query

	const url = new URL(request.url)
	let date = url.searchParams.get('date') ?? '00-00'

	try {
		let [yy, mm] = date?.split('-')

		if (mm.length === 1) {
			// This adds a leading zero
			mm = String(parseInt(mm)).padStart(2, '0')
		}

		date = `${yy}-${mm}`
	} catch (_) {
		console.error('bad date')
		return new Response('?date=YY-MM')
	}

	// Get transactions from database

	try {
		const db = env.BONJOURR_DB
		const statement = db.prepare('SELECT * FROM kofi_transactions WHERE date LIKE ?')
		const response = await statement.bind(`%${date}%`).run()

		const json = response.results.map((item: any) => ({
			...item,
			monthly: !!item.monthly,
		}))

		return Response.json(json, { headers })
	} catch (_) {
		//
	}

	return new Response('Internal Server Error', {
		status: 500,
		headers,
	})
}
