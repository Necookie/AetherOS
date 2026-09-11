import { jsonResponse, type PagesEnv } from '../_shared'

export const onRequestGet: PagesFunction<PagesEnv> = async () => {
    return jsonResponse({ ok: true, ts: Date.now(), runtime: 'cloudflare-pages' })
}
