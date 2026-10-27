import { createHash } from 'node:crypto'

// Best-effort per-instance protection; a distributed limiter is still recommended.
const attempts = new Map<string, { count: number; expires: number }>()
export function rateLimited(scope: string, request: Request, limit: number, windowMs: number) {
 const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
 const key = scope + ':' + createHash('sha256').update(ip).digest('hex')
 const now = Date.now()
 for (const [k,v] of attempts) if(v.expires <= now) attempts.delete(k)
 const previous = attempts.get(key)
 if (previous) { previous.count++; return previous.count > limit }
 if(attempts.size >= 10000) return true
 attempts.set(key, {count:1, expires:now+windowMs})
 return false
}
export function escapeHtml(value: string) {
 return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
}
export function validPushEndpoint(value: unknown): value is string {
 if(typeof value !== 'string' || value.length > 2048) return false
 try {
  const u=new URL(value)
  return u.protocol==='https:' && !u.username && !u.password && (!u.port || u.port==='443') &&
   (u.hostname==='fcm.googleapis.com' || u.hostname==='web.push.apple.com' || u.hostname.endsWith('.push.apple.com') || u.hostname==='updates.push.services.mozilla.com' || u.hostname.endsWith('.notify.windows.com'))
 } catch { return false }
}
