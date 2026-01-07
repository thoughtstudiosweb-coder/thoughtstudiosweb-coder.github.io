import { getFavicon } from './actions'
import FaviconEditor from './FaviconEditor'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FaviconPage() {
  const favicon = await getFavicon()
  
  return <FaviconEditor initialData={favicon} />
}

