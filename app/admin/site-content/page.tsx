import { getSiteContent } from './actions'
import SiteContentEditor from './SiteContentEditor'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SiteContentPage() {
  const content = await getSiteContent()
  
  return <SiteContentEditor initialData={content} />
}

