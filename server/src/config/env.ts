import dotenv from 'dotenv'

dotenv.config()

function parseOrigins(value: string | undefined) {
    return (value ?? 'http://localhost:5173')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
}

export const env = {
    port: parseInt(process.env.PORT || '3000', 10),
    openaiApiKey: process.env.OPENAI_API_KEY,
    tavilySearchApiKey: process.env.TAVILY_SEARCH_API_KEY || process.env.TAVILY_API_KEY,
    clientOrigins: parseOrigins(process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN),
}
