import type { Env } from './index.ts'

export async function translate(request: Request, env: Env, headers: Headers) {
	if (request.method !== 'POST') {
		return new Response('405 Method Not Allowed', {
			status: 405,
		})
	}

	const input = await request.text()

	const body = JSON.stringify({
		model: 'claude-sonnet-4-20250514',
		max_tokens: 1000,
		temperature: 0.9,
		system: env.ANTHROPIC_SYSTEM_PROMPT,
		messages: [{
			'role': 'user',
			'content': [
				{
					'type': 'text',
					'text': input,
				},
			],
		}],
	})

	headers.set('Content-Type', 'application/json')
	headers.set('x-api-key', env.ANTHROPIC_API_KEY ?? '')
	headers.set('anthropic-version', '2023-06-01')

	const method = 'POST'
	const url = 'https://api.anthropic.com/v1/messages'

	const response = await fetch(url, { body, method, headers })

	if (response.status === 200) {
		const json = await response.json<any>()
		const content = json.content[0].text
		return new Response(content)
	}

	return response
}
