import {getSiteConfig} from '@/lib/db'
import {getCollections} from '@/lib/db-collections'
import PublicShell from '@/components/storefront/PublicShell'
export const dynamic='force-dynamic'
export default async function PublicLayout({children}:{children:React.ReactNode}) {
 return <PublicShell config={await getSiteConfig()} collections={await getCollections() as unknown as {name:string;slug:string}[]}>{children}</PublicShell>
}
