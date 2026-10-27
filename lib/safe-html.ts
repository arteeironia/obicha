import sanitizeHtml from 'sanitize-html'
export function safeHtml(value: unknown) {
 return sanitizeHtml(typeof value==='string'?value:'', {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'h1', 'h2', 'span', 'font'],
  allowedAttributes: {a:['href','title','target','rel'],img:['src','alt','width','height'], '*':['class','style'],font:['color','size']},
  allowedSchemes:['http','https','mailto'],
  allowedSchemesByTag:{img:['https']},
  allowProtocolRelative:false,
  allowedStyles:{'*':{'text-align':[/^(left|right|center|justify)$/],color:[/^#[0-9a-fA-F]{3,8}$/], 'font-weight':[/^(bold|normal|[1-9]00)$/]}},
  transformTags:{a:sanitizeHtml.simpleTransform('a',{rel:'noopener noreferrer'})}
 })
}
