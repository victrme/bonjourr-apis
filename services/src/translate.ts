import type { Env } from './index.ts'

export async function translate(request: Request, env: Env, headers: Headers) {
	if (request.method !== 'POST') {
		return new Response('405 Method Not Allowed', {
			status: 405,
		})
	}

	const input = await request.text()
	const geminiRequest = createGeminiRequest(input)

	const key = env.GEMINI_API_KEY ?? 'AIzaSyBg5...'
	const model = 'gemini-2.0-flash-lite'
	const base = 'https://generativelanguage.googleapis.com/v1beta/models/'
	const search = `${model}:generateContent?key=${key}`
	const url = base + search

	const response = await fetch(url, {
		method: 'POST',
		body: JSON.stringify(geminiRequest),
		headers: { 'content-type': 'application/json' },
	})

	if (response.status === 200) {
		const json = await response.json<GeminiResponse>()

		try {
			const data = json.candidates[0].content.parts[0].text
			const h = { ...headers, 'content-type': 'application/json' }
			return new Response(data, { headers: h })
		} catch (_) {
			// ...
		}
	}

	return response
}

//
//
//

function createGeminiRequest(text: string): object {
	return {
		'system_instruction': {
			'parts': [
				{
					'text':
						"You are a translator for a web extension. Strings to translate are in JSON. It's important that the translation sounds natural, like the user interface or settings of a smartphone.",
				},
			],
		},
		'contents': [
			{
				'role': 'user',
				'parts': [{ 'text': text }],
			},
		],
		'generationConfig': {
			'maxOutputTokens': 1000,
			'temperature': 0.7,
			'thinkingConfig': {
				'thinkingBudget': 0,
			},
			'responseMimeType': 'application/json',
			'responseSchema': {
				'type': 'object',
				'properties': {
					'data': {
						'type': 'array',
						'items': {
							'type': 'object',
							'properties': {
								'in': {
									'type': 'string',
								},
								'out': {
									'type': 'string',
								},
							},
							'required': [
								'in',
								'out',
							],
						},
					},
				},
				'required': [
					'data',
				],
			},
		},
	}
}

interface GeminiResponse {
	candidates: {
		content: {
			parts: {
				text: string
			}[]
			role: 'model'
		}
		finishReason: 'STOP'
		index: number
	}[]
	usageMetadata: {
		promptTokenCount: number
		candidatesTokenCount: number
		totalTokenCount: number
		promptTokensDetails: {
			modality: 'TEXT'
			tokenCount: number
		}[]
	}
	modelVersion: string
	responseId: string
}

//
// Goodbye batch
//

// function createGeminiBatch(inputs: string[]): object {
// 	return {
// 		'batch': {
// 			'display_name': 'my-batch-requests',
// 			'input_config': {
// 				'requests': {
// 					'requests': inputs.map((input, i) => {
// 						return {
// 							'request': createGeminiRequest(input),
// 							'metadata': {
// 								'key': `request-${i}`,
// 							},
// 						}
// 					}),
// 				},
// 			},
// 		},
// 	}
// }

// interface BatchOperationResponse {
// 	name: string
// 	done: boolean
// 	metadata?: {
// 		progressPercentage: number
// 	}
// 	response?: {
// 		responses: GeminiResponse[]
// 	}
// 	error?: {
// 		code: number
// 		message: string
// 	}
// }
