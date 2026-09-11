import { requestChatCompletion } from './openaiClient'

export type AiServiceResponse =
    | { reply: string; mode: 'mock' }
    | { reply: string; mode: 'live' }

export async function getAiReply(message: string, openaiApiKey?: string): Promise<AiServiceResponse> {
    if (!openaiApiKey) {
        return {
            reply: `[MOCK] You asked: "${message}". Set OPENAI_API_KEY to use live AI.`,
            mode: 'mock',
        }
    }

    return {
        reply: await requestChatCompletion(openaiApiKey, message),
        mode: 'live',
    }
}
