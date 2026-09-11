import { jsonResponse, type PagesEnv } from '../_shared'

export const onRequest: PagesFunction<PagesEnv> = async () => {
    return jsonResponse({ error: 'API route not found.' }, 404)
}
