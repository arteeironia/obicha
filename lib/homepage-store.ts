import postgres from 'postgres'
import { defaultContent, type HomeContent } from './storefront/content'
import type { Design } from './storefront/catalog'
export const HOMEPAGE_KEY='homepage_content'
const sql=postgres(process.env.DATABASE_URL!,{ssl:'require'});
export type HomeState={draft:HomeContent;published:HomeContent;revision:number;updatedAt:string|null;publishedAt:string|null}
export async function readHome(products:Design[]):Promise<{state:HomeState;raw:string|null}> {
 const [row]=await sql`SELECT value FROM site_config WHERE key=${HOMEPAGE_KEY}`;
 if(row) return {state:JSON.parse(row.value),raw:row.value};
 const initial=defaultContent(products);
 return {state:{draft:initial,published:structuredClone(initial),revision:0,updatedAt:null,publishedAt:null},raw:null};
}
export async function writeHome(previous:{state:HomeState;raw:string|null},content:HomeContent,publish:boolean) {
 const now=new Date().toISOString();
 const state:HomeState={...previous.state,draft:content,revision:previous.state.revision+1,updatedAt:now,...(publish?{published:structuredClone(content),publishedAt:now}:{})};
 const value=JSON.stringify(state);
 const rows=previous.raw===null
  ? await sql`INSERT INTO site_config(key,value) VALUES (${HOMEPAGE_KEY},${value}) ON CONFLICT(key) DO NOTHING RETURNING key`
  : await sql`UPDATE site_config SET value=${value},updated_at=NOW() WHERE key=${HOMEPAGE_KEY} AND value=${previous.raw} RETURNING key`;
 return rows.length ? state : null;
}
