import type { RateLimitPluginOptions } from '@fastify/rate-limit'

export const rateLimitOptions: RateLimitPluginOptions = {
    max: 60,
    timeWindow: '1 minute',
    errorResponseBuilder(_request, context) {
        return {
            statusCode: 429,
            error: 'Too many requests.',
            message: 'Too many requests.',
            retryAfter: context.after,
        }
    },
}
