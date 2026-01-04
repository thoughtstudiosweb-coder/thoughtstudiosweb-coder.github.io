import { getFavicon } from './actions'
import FaviconEditor from './FaviconEditor'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FaviconPage() {
  console.log('🔍 Favicon page: Fetching data from Postgres...')
  const favicon = await getFavicon()
  console.log(`✅ Favicon page: Retrieved favicon data ${favicon ? '(exists)' : '(null)'}`)
  
  return <FaviconEditor initialData={favicon} />
}


