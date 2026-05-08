import dotenv from 'dotenv'

dotenv.config()

export const env = {
    port: parseInt(process.env.PORT || '3000', 10),
    openaiApiKey: process.env.OPENAI_API_KEY,
    tavilySearchApiKey: process.env.TAVILY_SEARCH_API_KEY || process.env.TAVILY_API_KEY,
}
