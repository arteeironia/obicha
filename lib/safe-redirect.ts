export function safeRedirect(value: unknown, origin: string, fallback = '/') {
 if(typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f]/.test(value)) return fallback
 try {const url=new URL(value,origin);return url.origin===origin ? url.pathname+url.search+url.hash : fallback} catch {return fallback}
}
