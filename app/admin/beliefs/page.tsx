import { readJSON } from '@/lib/content'
import BeliefsEditor from './BeliefsEditor'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Belief {
  title: string
  description: string
  icon: string
}

export default async function BeliefsPage() {
  console.log('🔍 Beliefs page: Fetching data from Postgres...')
  const beliefs = await readJSON<Belief[]>('beliefs.json')
  console.log(`✅ Beliefs page: Retrieved ${Array.isArray(beliefs) ? beliefs.length : 0} beliefs`)
  
  return <BeliefsEditor initialData={beliefs || []} />
}
