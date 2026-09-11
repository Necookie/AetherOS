export interface PagesEnv {
    OPENAI_API_KEY?: string
    TAVILY_SEARCH_API_KEY?: string
    TAVILY_API_KEY?: string
}

export function jsonResponse(body: unknown, status = 200, headers?: HeadersInit) {
    return Response.json(body, {
        status,
        headers: {
            'Cache-Control': 'no-store',
            ...headers,
        },
    })
}
