export async function shareProduct(title:string,url:string,copyOnly=false):Promise<'shared'|'copied'|'cancelled'>{
 if(!copyOnly&&typeof navigator.share==='function'){
  try{await navigator.share({title,url});return 'shared'}catch(error){if(error instanceof Error&&error.name==='AbortError')return 'cancelled'}
 }
 if(!navigator.clipboard?.writeText)throw new Error('Copie o endereço exibido abaixo.');
 await navigator.clipboard.writeText(url);return 'copied';
}
