import { readJSON } from '@/lib/content'
import ExploreEditor from './ExploreEditor'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Explore {
  title: string
  description: string
  icon: string
}

export default async function ExplorePage() {
  console.log('🔍 Explore page: Fetching data from Postgres...')
  const explore = await readJSON<Explore[]>('explore.json')
  console.log(`✅ Explore page: Retrieved ${Array.isArray(explore) ? explore.length : 0} explore items`)
  
  return <ExploreEditor initialData={explore || []} />
}
