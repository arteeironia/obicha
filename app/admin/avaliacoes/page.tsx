import { isAdmin } from '@/lib/admin-access'
import { redirect } from 'next/navigation'
import { readReviews } from '@/lib/reviews-store'
import AdminReviews from '@/components/reviews/AdminReviews'
export const dynamic = 'force-dynamic'
export default async function Page() {
  if (!await isAdmin()) redirect('/admin/login')
  return <AdminReviews initial={(await readReviews()).state}/>
}
