import {getSiteConfig} from '@/lib/db'
import PublicShell from '@/components/storefront/PublicShell'
export const dynamic='force-dynamic'
export default async function PublicLayout({children}:{children:React.ReactNode}) {
 return <PublicShell config={await getSiteConfig()}>{children}</PublicShell>
}
